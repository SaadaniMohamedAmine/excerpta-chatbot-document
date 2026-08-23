// lib/export/docx.ts
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
} from "docx";
import type { Citation, ExportConversation } from "./types";

// Hex colors for the `docx` package must be 6-char hex WITHOUT a leading "#".
const COLORS = {
  ink: "1E3A8A",
  gold: "D4A537",
  textPrimary: "0F172A",
  textSecondary: "475569",
  border: "E2E8F0",
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export async function generateConversationDocx(
  conversation: ExportConversation
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // --- Title block ---
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: conversation.title,
          bold: true,
          color: COLORS.ink,
          size: 40, // 20pt, docx sizes are in half-points
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border, space: 8 },
      },
      children: [
        new TextRun({
          text: `Exported from Excerpta — ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          italics: true,
          color: COLORS.textSecondary,
          size: 18, // 9pt
        }),
      ],
    })
  );

  // --- Messages ---
  for (const message of conversation.messages) {
    if (message.role === "user") {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 40 },
          children: [
            new TextRun({ text: "QUESTION", bold: true, color: COLORS.ink, size: 16 }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: message.content,
              bold: true,
              color: COLORS.textPrimary,
              size: 22, // 11pt
            }),
          ],
        })
      );
    } else {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 40 },
          children: [
            new TextRun({
              text: "ANSWER",
              bold: true,
              color: COLORS.textSecondary,
              size: 16,
            }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: message.content, color: COLORS.textPrimary, size: 22 }),
          ],
        })
      );

      const citations = message.citations ?? ([] as Citation[]);
      for (const citation of citations) {
        const pageLabel = citation.pageNumber != null ? `p. ${citation.pageNumber}` : "source";
        children.push(
          new Paragraph({
            indent: { left: 360 }, // 0.25in, in twentieths of a point (twips)
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `Source: ${pageLabel} — "${truncate(citation.excerpt, 140)}"`,
                italics: true,
                color: COLORS.gold,
                size: 18,
              }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri" } },
      },
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}
