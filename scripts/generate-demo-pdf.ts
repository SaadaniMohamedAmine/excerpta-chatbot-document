// scripts/generate-demo-pdf.ts
//
// Generates the onboarding demo document (public/demo/getting-started-with-excerpta.pdf).
// Built with pdfkit (already a project dependency, used by lib/export/pdf.ts)
// rather than shipped as a binary asset, since there's no raw file to copy in —
// this recreates it from the approved copy. Re-run after editing the content below.
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";

type PDFDoc = InstanceType<typeof PDFDocument>;

// Same palette as lib/export/pdf.ts, kept independent on purpose — this
// script has no reason to depend on runtime app code.
const COLORS = {
  ink: "#1E3A8A",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
};

const OUTPUT_PATH = join(process.cwd(), "public", "demo", "getting-started-with-excerpta.pdf");

function heading(doc: PDFDoc, text: string) {
  doc.moveDown(1).font("Helvetica-Bold").fontSize(14).fillColor(COLORS.ink).text(text);
  doc.moveDown(0.4);
}

function subheading(doc: PDFDoc, text: string) {
  doc.moveDown(0.6).font("Helvetica-Bold").fontSize(11).fillColor(COLORS.ink).text(text);
  doc.moveDown(0.2);
}

function body(doc: PDFDoc, text: string) {
  doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.textPrimary).text(text, { align: "left" });
}

function bullet(doc: PDFDoc, label: string, rest: string) {
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(COLORS.textPrimary)
    .text(`•  `, { continued: true })
    .font("Helvetica-Bold")
    .text(`${label} `, { continued: true })
    .font("Helvetica")
    .text(`— ${rest}`);
  doc.moveDown(0.2);
}

async function generate(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      bufferPages: true,
      info: { Title: "Getting Started with Excerpta" },
    });
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      doc.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.ink).text("Getting Started with Excerpta");
      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(11)
        .fillColor(COLORS.textSecondary)
        .text("Precise answers, cited to the line.");

      heading(doc, "Welcome");
      body(
        doc,
        "Excerpta turns any document into a conversation. Upload a PDF, a Word file, a spreadsheet, or a piece of source code, and ask it questions in plain language. Every answer Excerpta gives you is grounded in the document itself, and every claim comes with a citation you can click to jump straight to the exact page and passage it was drawn from. You are reading this guide inside Excerpta right now — try asking a question about it in the chat panel to see citations in action."
      );

      heading(doc, "Why citations matter");
      body(
        doc,
        'Most AI assistants answer confidently whether or not they are right. Excerpta is built around a different idea: an answer is only useful if you can verify it. That is why every response is anchored to a specific excerpt of your source document. When you see a citation tag like "p. 3" next to an answer, clicking it scrolls the document viewer directly to that passage and highlights it in gold, so you can check the source yourself in seconds instead of taking the answer on faith.'
      );

      heading(doc, "How it works");

      subheading(doc, "1. Upload a document");
      body(
        doc,
        "From the Documents page, drop in a PDF, DOCX, CSV, or code file. Excerpta extracts the text, splits it into overlapping chunks so that context near page boundaries is never lost, and generates embeddings for each chunk so it can find the most relevant passages later."
      );

      subheading(doc, "2. Ask a question");
      body(
        doc,
        "Open the document and type a question in the chat panel, the same way you would ask a colleague who had just read the file. Excerpta retrieves the passages most relevant to your question and uses them, and only them, to write its answer."
      );

      subheading(doc, "3. Verify the citation");
      body(
        doc,
        "Every answer ends with one or more citation tags. Click a tag to jump to that exact page in the viewer, with the cited excerpt highlighted. If a claim in the answer doesn't have a citation backing it, that's a signal to double-check it — Excerpta is designed to make that easy, not to hide it."
      );

      doc.addPage();

      heading(doc, "Supported file types");
      doc.moveDown(0.2);
      bullet(doc, "PDF", "reports, papers, contracts, manuals");
      bullet(doc, "DOCX", "Word documents");
      bullet(doc, "CSV", "spreadsheets and tabular data");
      bullet(doc, "Code", "source files, read with syntax highlighting");

      heading(doc, "Collections");
      body(
        doc,
        "If a question spans more than one file — comparing two contracts, or cross-referencing a spec against its changelog — group the related documents into a Collection. A Collection chat still cites its sources by page and by document, so you always know which file an answer came from."
      );

      heading(doc, "Your data");
      body(
        doc,
        "Documents you upload are private to your account. You can remove a document at any time from its menu, which also deletes its extracted text and embeddings. Deleting your account removes everything associated with it."
      );

      heading(doc, "This document");
      body(
        doc,
        "This guide was created automatically the first time you opened Excerpta, so you would have something to try the product on right away. Feel free to delete it once you have uploaded your own documents — or keep it around as a quick reference."
      );

      doc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

async function main() {
  const buffer = await generate();
  mkdirSync(join(process.cwd(), "public", "demo"), { recursive: true });
  writeFileSync(OUTPUT_PATH, buffer);
  console.log(`Wrote ${buffer.length} bytes to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
