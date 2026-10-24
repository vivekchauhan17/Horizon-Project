import { extractText, getDocumentProxy } from 'unpdf';
import { HttpError } from '../middleware/error.middleware.js';

export async function extractPdfText(buffer) {
  if (buffer.subarray(0, 5).toString() !== '%PDF-') throw new HttpError(400, 'File is not a valid PDF.');
  let text;
  try {
    const doc = await getDocumentProxy(new Uint8Array(buffer), { verbosity: 0 }); ({ text } = await extractText(doc, { mergePages: true }));
  } catch { throw new HttpError(400, 'Could not read this PDF. It may be corrupted or password-protected.'); }
  text = text.trim();
  if (text.length < 50) throw new HttpError(422, 'No readable text found. Scanned/image PDFs are not supported.');
  return text;
}
