import { Fragment } from "react";

/**
 * Keeps hyphenated words ("long-term", "Origin-Backed") on one line in large type,
 * where a break at the hyphen reads as a broken word. The text is unchanged.
 */
export function KeepHyphens({ text }: { text: string }) {
  return text.split(/(\S+-\S+)/).map((part, n) =>
    n % 2 ? (
      <span key={n} className="nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={n}>{part}</Fragment>
    ),
  );
}
