import * as pdfParseModule from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import Tesseract from "tesseract.js";
import path from "path";

export type ExtractionMethod =
  | "pdf-text"   // ✅ native PDF text — very accurate
  | "gemini"     // ✅ Gemini Vision OCR — very accurate
  | "tesseract"  // ⚠️ local OCR — moderate accuracy
  | "filename"   // ⚠️ filename-only fallback — AI guesses from topic name only
  | "raw-text";  // ✅ raw file text — accurate

export interface ExtractionResult {
  text: string;
  method: ExtractionMethod;
  confidence: "high" | "low";
}

/**
 * Returns extracted text plus a confidence rating so the caller can
 * surface a disclaimer in the UI when extraction quality is uncertain.
 *
 * Confidence = "high"  → text came from native PDF parsing or a Vision model
 * Confidence = "low"   → text came from local Tesseract OCR or the filename fallback
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  const lowerName = fileName.toLowerCase();
  const ext = path.extname(lowerName);
  const isPdf = mimeType === "application/pdf" || ext === ".pdf";
  const cleanTopicName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();

  console.log(`[fileExtractor] Processing "${fileName}" (${mimeType}, ${fileBuffer.length} bytes)...`);

  // ── 1. Native PDF Text ─────────────────────────────────────────────────────
  if (isPdf) {
    try {
      const parseFn: any =
        typeof pdfParseModule === "function"
          ? pdfParseModule
          : (pdfParseModule as any)?.default &&
            typeof (pdfParseModule as any).default === "function"
          ? (pdfParseModule as any).default
          : pdfParseModule;

      const parsed = await parseFn(fileBuffer);
      const text: string = parsed?.text ?? "";
      if (text.trim().length > 30) {
        console.log(`[fileExtractor] PDF text extracted: ${text.length} chars`);
        return { text: text.trim(), method: "pdf-text", confidence: "high" };
      }
    } catch (err) {
      console.warn("[fileExtractor] pdf-parse failed:", err);
    }

    // Raw byte-string fallback (catches some scanned PDFs with embedded text)
    try {
      const raw = fileBuffer.toString("utf-8");
      const chunks = raw.match(/[\x20-\x7E]{5,}/g);
      if (chunks && chunks.length > 10) {
        const extracted = chunks.join(" ").replace(/\s+/g, " ").trim();
        if (extracted.length > 80) {
          console.log(`[fileExtractor] Raw PDF bytes extracted: ${extracted.length} chars`);
          return { text: extracted, method: "raw-text", confidence: "high" };
        }
      }
    } catch (_) {}
  }

  // ── 2. Gemini Vision (image or scanned PDF with no embedded text) ──────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[fileExtractor] Running Gemini Vision on "${fileName}"...`);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const base64 = fileBuffer.toString("base64");
      const supportedMime: "image/png" | "image/jpeg" | "image/webp" = ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: supportedMime, data: base64 } },
              {
                text:
                  "You are an OCR engine. Read every line of text in this image — " +
                  "headings, body text, numbered questions, definitions, bullet points. " +
                  "Output ONLY the raw transcribed text. No commentary.",
              },
            ],
          },
        ],
      });

      const extracted = result.text?.trim() ?? "";
      if (extracted.length > 30) {
        console.log(`[fileExtractor] Gemini Vision extracted: ${extracted.length} chars`);
        return { text: extracted, method: "gemini", confidence: "high" };
      }
    } catch (err: any) {
      console.warn("[fileExtractor] Gemini Vision failed:", err?.message || err);
    }
  }

  // ── 3. Tesseract OCR (local fallback — moderate accuracy) ─────────────────
  try {
    console.log(`[fileExtractor] Running Tesseract OCR on "${fileName}"...`);
    const worker = await Tesseract.createWorker("eng");
    const ret = await worker.recognize(fileBuffer);
    await worker.terminate();

    const ocrText = ret?.data?.text?.trim() ?? "";
    if (ocrText.length > 30) {
      console.log(`[fileExtractor] Tesseract OCR extracted: ${ocrText.length} chars`);
      return { text: ocrText, method: "tesseract", confidence: "low" };
    }
  } catch (ocrErr: any) {
    console.warn("[fileExtractor] Tesseract OCR failed:", ocrErr?.message || ocrErr);
  }

  // ── 4. Filename-only fallback — AI works from topic name only ──────────────
  console.log(`[fileExtractor] Using filename fallback for "${cleanTopicName}"`);
  const fallbackText = `Study notes on topic: ${cleanTopicName}. Covers definitions, key concepts, applications, and core principles of ${cleanTopicName}.`;
  return { text: fallbackText, method: "filename", confidence: "low" };
}
