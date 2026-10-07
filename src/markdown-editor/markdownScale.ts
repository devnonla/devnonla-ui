import type { CSSProperties } from "react";

/** `docs` is the article scale. `chat` is the tighter thread scale. */
export type MarkdownVariant = "docs" | "chat";

/**
 * Size and spacing for each scale. Class fallbacks match `docs`, so the editor
 * preview stays on the article scale when no preset is set.
 * Docs body is 16px. Chat body and h1–h3 are 15px. Inline code is 14px on docs, 13px in chat.
 */
const MARKDOWN_PRESETS = {
  docs: {
    "--md-body-size": "16px",
    "--md-body-leading": "24px",
    "--md-h1-size": "32px",
    "--md-h1-leading": "1.25",
    "--md-h1-weight": "800",
    "--md-h1-mt": "0px",
    "--md-h1-mb": "12px",
    "--md-h1-py": "3px",
    "--md-h2-size": "30px",
    "--md-h2-leading": "40px",
    "--md-h2-weight": "600",
    "--md-h2-mt": "24px",
    "--md-h2-mb": "1px",
    "--md-h2-py": "3px",
    "--md-h3-size": "24px",
    "--md-h3-leading": "32px",
    "--md-h3-weight": "700",
    "--md-h3-mt": "22px",
    "--md-h3-mb": "1px",
    "--md-h4-size": "20px",
    "--md-h4-leading": "26px",
    "--md-h4-weight": "700",
    "--md-h4-mt": "16px",
    "--md-h4-mb": "1px",
    "--md-h5-size": "16px",
    "--md-h5-leading": "1.375",
    "--md-h5-weight": "700",
    "--md-h5-mt": "0px",
    "--md-h5-mb": "0px",
    "--md-h6-size": "14px",
    "--md-h6-leading": "1.375",
    "--md-h6-weight": "700",
    "--md-h6-mt": "0px",
    "--md-h6-mb": "0px",
    "--md-strong-weight": "600",
    "--md-p-my": "1px",
    "--md-p-py": "4px",
    "--md-p-leading": "1.5",
    "--md-list-my": "8px",
    "--md-ul-pl": "4px",
    "--md-ol-pl": "4px",
    "--md-li-mt": "4px",
    "--md-quote-my": "4px",
    "--md-rule-my": "8px",
    "--md-img-my": "4px",
    "--md-table-my": "16px",
    "--md-table-size": "15px",
    "--md-code-my": "8px",
    "--md-inline-size": "14px",
    "--md-item-pl": "4px",
    "--md-nest": "1.25rem",
  },
  chat: {
    "--md-body-size": "15px",
    "--md-body-leading": "24px",
    "--md-h1-size": "15px",
    "--md-h1-leading": "24px",
    "--md-h1-weight": "600",
    "--md-h1-mt": "0px",
    "--md-h1-mb": "2px",
    "--md-h1-py": "0px",
    "--md-h2-size": "15px",
    "--md-h2-leading": "24px",
    "--md-h2-weight": "600",
    "--md-h2-mt": "12px",
    "--md-h2-mb": "2px",
    "--md-h2-py": "0px",
    "--md-h3-size": "15px",
    "--md-h3-leading": "24px",
    "--md-h3-weight": "600",
    "--md-h3-mt": "10px",
    "--md-h3-mb": "2px",
    "--md-h4-size": "15px",
    "--md-h4-leading": "24px",
    "--md-h4-weight": "600",
    "--md-h4-mt": "8px",
    "--md-h4-mb": "2px",
    "--md-h5-size": "14px",
    "--md-h5-leading": "22px",
    "--md-h5-weight": "600",
    "--md-h5-mt": "6px",
    "--md-h5-mb": "0px",
    "--md-h6-size": "14px",
    "--md-h6-leading": "22px",
    "--md-h6-weight": "600",
    "--md-h6-mt": "6px",
    "--md-h6-mb": "0px",
    "--md-strong-weight": "400",
    "--md-p-my": "0px",
    "--md-p-py": "1px",
    "--md-p-leading": "1.5",
    "--md-list-my": "4px",
    "--md-ul-pl": "4px",
    "--md-ol-pl": "4px",
    "--md-li-mt": "2px",
    "--md-quote-my": "2px",
    "--md-rule-my": "6px",
    "--md-img-my": "4px",
    "--md-table-my": "8px",
    "--md-table-size": "15px",
    "--md-code-my": "6px",
    "--md-inline-size": "13px",
    "--md-item-pl": "4px",
    "--md-nest": "1rem",
  },
} as const;

export function markdownVariantStyle(variant: MarkdownVariant = "docs"): CSSProperties {
  return MARKDOWN_PRESETS[variant] as CSSProperties;
}

/**
 * Article headings. A markdown `#` paints the same as `##`.
 * The large page title is `pageTitleClass`, used by Typography only.
 */
export function headingClass(level: number): string {
  if (level <= 1) return "text-(--md-heading) mt-(--md-h2-mt,24px) mb-(--md-h1-mb,12px) pt-(--md-h2-py,3px) pb-(--md-h2-py,3px) text-(length:--md-h2-size,30px) leading-(--md-h2-leading,40px) font-(--md-h2-weight,600)";
  if (level === 2) return "text-(--md-heading) mt-(--md-h2-mt,24px) mb-(--md-h2-mb,1px) pt-(--md-h2-py,3px) pb-(--md-h2-py,3px) text-(length:--md-h2-size,30px) leading-(--md-h2-leading,40px) font-(--md-h2-weight,600)";
  if (level === 3) return "text-(--md-heading) mt-(--md-h3-mt,22px) mb-(--md-h3-mb,1px) text-(length:--md-h3-size,24px) leading-(--md-h3-leading,32px) font-(--md-h3-weight,700)";
  if (level === 4) return "text-(--md-heading) mt-(--md-h4-mt,16px) mb-(--md-h4-mb,1px) text-(length:--md-h4-size,20px) leading-(--md-h4-leading,26px) font-(--md-h4-weight,700)";
  if (level === 5) return "text-(--md-heading) mt-(--md-h5-mt,0px) mb-(--md-h5-mb,0px) text-(length:--md-h5-size,16px) leading-(--md-h5-leading,1.375) font-(--md-h5-weight,700)";
  return "text-(--md-heading) mt-(--md-h6-mt,0px) mb-(--md-h6-mb,0px) text-(length:--md-h6-size,14px) leading-(--md-h6-leading,1.375) font-(--md-h6-weight,700)";
}

/** Landing and page title. Not used inside markdown. */
export const pageTitleClass = "text-(--md-heading) mt-(--md-h1-mt,0px) mb-(--md-h1-mb,1px) pt-(--md-h1-py,3px) pb-(--md-h1-py,3px) text-(length:--md-h1-size,32px) leading-(--md-h1-leading,1.25) font-(--md-h1-weight,800) tracking-tight";

/** Body line. Same size and color as a markdown paragraph. */
export const markdownBodyClass = "text-(length:--md-body-size,16px) leading-(--md-body-leading,24px) text-(--md-ink)";

/** Paragraph box. Same rhythm as `MarkdownViewer` `p`. */
export const markdownParagraphClass = "nonla-typo m-0 my-(--md-p-my,1px) py-(--md-p-py,4px) text-(length:--md-body-size,16px) leading-(--md-p-leading,1.5) text-(--md-ink)";
