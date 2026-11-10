<?php
/**
 * GazMin Commodities: the contact form's mailer, for the cPanel host (PHP 7.4 or later).
 *
 * The form at /contact/ posts here. With script it asks for JSON and shows the result in
 * place; without script the visitor is redirected back to /contact/#sent or #form-error.
 *
 * Before go-live: set FROM to a real mailbox on the site's own domain (cPanel > Email
 * Accounts), and check SPF and DKIM in cPanel > Email Deliverability, or mail may land in spam.
 */
declare(strict_types=1);

const TO = 'commodity@gazminintl.com';
const FROM = ''; // e.g. 'no-reply@gazmincommodity.com'; empty means no-reply@<the site's domain>

$wantsJson = strpos((string) ($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json') !== false;

function finish(bool $ok, int $status, string $message, bool $json): void
{
    http_response_code($status);
    header('Cache-Control: no-store');
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Location: /contact/?' . ($ok ? 'sent=1#sent' : 'error=1#form-error'), true, 303);
    }
    exit;
}

/** A posted field, trimmed and capped. */
function field(string $name, int $max): string
{
    $value = trim(str_replace(["\r\n", "\r"], "\n", (string) ($_POST[$name] ?? '')));
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

/** One line only: header fields must never carry a line break. */
function oneLine(string $value): string
{
    return trim((string) preg_replace('/[\r\n\t]+/', ' ', $value));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    if (!$wantsJson) { // someone opened the address itself: show them the form, not an error
        header('Location: /contact/', true, 303);
        exit;
    }
    finish(false, 405, 'Please use the form at /contact/.', true);
}

// People never see the "website" field; bots fill it in. Answer as if sent.
if (field('website', 200) !== '') {
    finish(true, 200, 'Thank you.', $wantsJson);
}

$first    = oneLine(field('first_name', 80));
$last     = oneLine(field('last_name', 80));
$email    = oneLine(field('email', 200));
$subject  = oneLine(field('subject', 160));
$comments = field('comments', 5000);

if ($first === '' || $last === '' || $subject === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    finish(false, 422, 'Please give your first and last name, a valid email address and a subject.', $wantsJson);
}

$host = strtolower((string) preg_replace('/^www\./i', '', (string) ($_SERVER['SERVER_NAME'] ?? '')));
$from = FROM !== '' ? FROM : (preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $host) ? 'no-reply@' . $host : TO);

$body = "New enquiry from the GazMin Commodities website\n\n"
    . "Name: {$first} {$last}\n"
    . "Email: {$email}\n"
    . "Subject: {$subject}\n\n"
    . ($comments !== '' ? "Comments / Questions:\n{$comments}\n" : "No comments given.\n");

$headers = implode("\r\n", [
    'From: GazMin Commodities website <' . $from . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = mail(TO, '=?UTF-8?B?' . base64_encode('Website enquiry: ' . $subject) . '?=', $body, $headers, '-f' . $from);

if ($sent) {
    finish(true, 200, 'Thank you. Your message has been sent.', $wantsJson);
}
finish(false, 500, 'The message could not be sent. Please email ' . TO . '.', $wantsJson);
