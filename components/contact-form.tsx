"use client";

import { useState, type FormEvent } from "react";

type Field = { type: string; label: string; required: boolean; placeholder?: string; firstPlaceholder?: string; lastPlaceholder?: string };
type State = "idle" | "sending" | "sent" | "error";

/**
 * The enquiry form (fields from the client's form spec). It posts to /contact.php on the
 * cPanel host. Without script that is a plain POST and a redirect back to #sent or
 * #form-error; with script it sends in place and reports here.
 */
export function ContactForm({ fields, submitText, email, phone }: { fields: Field[]; submitText: string; email: string; phone: string }) {
  const [state, setState] = useState<State>("idle");
  const [name, mail, subject, comments] = ["name", "email", "text", "textarea"].map((t) => fields.find((f) => f.type === t)!);

  async function submit(e: FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error(String(res.status));
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <form className="form" action="/contact.php" method="post" onSubmit={submit}>
      <p id="sent" className="form__note form__note--ok" tabIndex={-1}>
        Thank you. Your message has been sent, and the trading desk will reply soon.
      </p>
      <p id="form-error" className="form__note form__note--error" tabIndex={-1}>
        The message could not be sent. Please email <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <fieldset className="form__name">
        <legend>{name.label}</legend>
        <div className="form__row">
          <label className="field">
            <span>First name</span>
            <span className="field__box" data-glow>
              <input name="first_name" autoComplete="given-name" required maxLength={80} placeholder={name.firstPlaceholder} />
            </span>
          </label>
          <label className="field">
            <span>Last name</span>
            <span className="field__box" data-glow>
              <input name="last_name" autoComplete="family-name" required maxLength={80} placeholder={name.lastPlaceholder} />
            </span>
          </label>
        </div>
      </fieldset>
      <label className="field">
        <span>{mail.label}</span>
        <span className="field__box" data-glow>
          <input type="email" name="email" autoComplete="email" required maxLength={200} placeholder={mail.placeholder} />
        </span>
      </label>
      <label className="field">
        <span>{subject.label}</span>
        <span className="field__box" data-glow>
          <input name="subject" required maxLength={160} placeholder={subject.placeholder} />
        </span>
      </label>
      <label className="field">
        <span>
          {comments.label} <small>(optional)</small>
        </span>
        <span className="field__box" data-glow>
          <textarea name="comments" rows={5} maxLength={5000} placeholder={comments.placeholder} />
        </span>
      </label>
      <div className="form__trap" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form__foot">
        <button className="btn" type="submit" disabled={state === "sending"} aria-busy={state === "sending"}>
          {state === "sending" ? "Sending…" : submitText}
        </button>
        <p className="form__status" role="status">
          {state === "sent" && "Thank you. Your message has been sent, and the trading desk will reply soon."}
          {state === "error" && (
            <>
              The message could not be sent from this page. Please email <a href={`mailto:${email}`}>{email}</a> or call{" "}
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>.
            </>
          )}
        </p>
      </div>
    </form>
  );
}
