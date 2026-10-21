import type { CSSProperties } from "react";

/**
 * One markdown scale. Body reads `--nonla-base-text-size` (`text-base`). Leading is 1.6.
 * Tables always use `text-base`.
 * Fenced code reads `--nonla-mono-text-size`, which is `text-sm`.
 * Inline code is `0.875em` of the surrounding text, so the chip stays inside the line.
 * Class fallbacks match these values when the variables are not set.
 */
export const markdownScaleStyle = {
  "--md-body-size": "var(--nonla-base-text-size)",
  "--md-body-leading": "calc(var(--nonla-base-text-size) * 1.6)",
  "--md-h1-size": "32px",
  "--md-h1-leading": "1.25",
  "--md-h1-weight": "800",
  "--md-h1-mt": "0px",
  "--md-h1-mb": "12px",
  "--md-h1-py": "3px",
  "--md-h2-size": "26px",
  "--md-h2-leading": "32px",
  "--md-h2-weight": "600",
  "--md-h2-mt": "24px",
  "--md-h2-mb": "8px",
  "--md-h2-py": "3px",
  "--md-h3-size": "24px",
  "--md-h3-leading": "32px",
  "--md-h3-weight": "600",
  "--md-h3-mt": "22px",
  "--md-h3-mb": "8px",
  "--md-h4-size": "20px",
  "--md-h4-leading": "26px",
  "--md-h4-weight": "700",
  "--md-h4-mt": "16px",
  "--md-h4-mb": "1px",
  "--md-h5-size": "20px",
  "--md-h5-leading": "26px",
  "--md-h5-weight": "700",
  "--md-h5-mt": "16px",
  "--md-h5-mb": "1px",
  "--md-h6-size": "20px",
  "--md-h6-leading": "26px",
  "--md-h6-weight": "700",
  "--md-h6-mt": "16px",
  "--md-h6-mb": "1px",
  "--md-strong-weight": "600",
  "--md-p-my": "1px",
  "--md-p-py": "4px",
  "--md-p-leading": "1.6",
  "--md-list-my": "8px",
  "--md-ul-pl": "4px",
  "--md-ol-pl": "4px",
  "--md-li-mt": "4px",
  "--md-quote-my": "0px",
  "--md-rule-my": "8px",
  "--md-img-my": "4px",
  "--md-table-my": "16px",
  "--md-code-my": "8px",
  "--md-code-size": "var(--nonla-mono-text-size)",
  "--md-code-leading": "calc(var(--nonla-mono-text-size) * 1.6)",
  "--md-inline-size": "0.875em",
  "--md-item-pl": "4px",
  "--md-nest": "1.25rem",
} as CSSProperties;

/**
 * Article headings. A markdown `#` paints the same as `##`.
 * `#####` and `######` paint the same as `####`.
 * The large page title is `pageTitleClass`, used by Typography only.
 */
export function headingClass(level: number): string {
  if (level <= 1) return "text-foreground mt-(--md-h2-mt,24px) mb-(--md-h1-mb,12px) pt-(--md-h2-py,3px) pb-(--md-h2-py,3px) text-(length:--md-h2-size,26px) leading-(--md-h2-leading,32px) font-(--md-h2-weight,600)";
  if (level === 2) return "text-foreground mt-(--md-h2-mt,24px) mb-(--md-h2-mb,8px) pt-(--md-h2-py,3px) pb-(--md-h2-py,3px) text-(length:--md-h2-size,26px) leading-(--md-h2-leading,32px) font-(--md-h2-weight,600)";
  if (level === 3) return "text-foreground mt-(--md-h3-mt,22px) mb-(--md-h3-mb,8px) text-(length:--md-h3-size,24px) leading-(--md-h3-leading,32px) font-(--md-h3-weight,600)";
  return "text-foreground mt-(--md-h4-mt,16px) mb-(--md-h4-mb,1px) text-(length:--md-h4-size,20px) leading-(--md-h4-leading,26px) font-(--md-h4-weight,700)";
}

/** Landing and page title. Not used inside markdown. */
export const pageTitleClass = "text-foreground mt-(--md-h1-mt,0px) mb-(--md-h1-mb,1px) pt-(--md-h1-py,3px) pb-(--md-h1-py,3px) text-(length:--md-h1-size,32px) leading-(--md-h1-leading,1.25) font-(--md-h1-weight,800) tracking-tight";

/** Body line. Same size and color as a markdown paragraph. */
export const markdownBodyClass = "text-(length:--md-body-size,var(--nonla-base-text-size,15px)) leading-(--md-body-leading,calc(var(--nonla-base-text-size,15px)*1.6)) text-foreground";

/** Paragraph box. Same rhythm as `MarkdownViewer` `p`. */
export const markdownParagraphClass = "nonla-typo m-0 my-(--md-p-my,1px) py-(--md-p-py,4px) text-(length:--md-body-size,var(--nonla-base-text-size,15px)) leading-(--md-p-leading,1.6) text-foreground";

/**
 * Inline code. Smaller than the line, normal weight, with a light wash.
 * The wash is ink on whatever sits behind, so it stays visible on the page and on a card.
 * A token stays whole; the line breaks before it.
 */
export const markdownInlineCodeClass =
  "nonla-inline-code rounded-[4px] bg-[color-mix(in_oklab,var(--nonla-text-main)_6%,transparent)] px-[0.25em] py-px align-baseline font-mono text-(length:--md-inline-size,0.875em) leading-none whitespace-nowrap";
