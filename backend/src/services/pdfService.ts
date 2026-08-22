import pdfParse from 'pdf-parse';
import fs from 'fs';

export const extractTextFromPdf = async (fileBufferOrPath: Buffer | string): Promise<string> => {
  try {
    let buffer: Buffer;
    if (typeof fileBufferOrPath === 'string') {
      buffer = await fs.promises.readFile(fileBufferOrPath);
    } else {
      buffer = fileBufferOrPath;
    }

    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('[pdfService] Error parsing PDF text:', error);
    throw new Error(`Failed to extract text from PDF document: ${(error as Error).message}`);
  }
};
