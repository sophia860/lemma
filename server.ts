import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Document Export (PDF/DOCX)
  app.post("/api/export/pdf", async (req, res) => {
    try {
      const { title, sections } = req.body;
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="suitability-report.pdf"`);
      
      doc.pipe(res);
      doc.fontSize(25).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();
      
      sections.forEach((s: any) => {
        doc.fontSize(16).font('Helvetica-Bold').text(s.heading);
        doc.fontSize(12).font('Helvetica').text(s.body.replace(/[#*]/g, '')); // Basic markdown cleanup for PDFKit
        doc.moveDown();
      });
      
      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).send("PDF Generation Failed");
    }
  });

  app.post("/api/export/docx", async (req, res) => {
    try {
      const { title, sections } = req.body;
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 48 })],
            }),
            ...sections.flatMap((s: any) => [
              new Paragraph({
                children: [new TextRun({ text: s.heading, bold: true, size: 32 })],
                spacing: { before: 400 },
              }),
              new Paragraph({
                children: [new TextRun({ text: s.body.replace(/[#*]/g, ''), size: 24 })],
              }),
            ]),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="suitability-report.docx"`);
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send("DOCX Generation Failed");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
