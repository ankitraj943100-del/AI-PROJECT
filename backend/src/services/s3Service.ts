import fs from 'fs';
import path from 'path';

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const storePdfFile = async (file: Express.Multer.File): Promise<{ fileUrl: string; filePath: string }> => {
  // Save locally under backend/uploads
  const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);
  const fileUrl = `/uploads/${fileName}`;

  return { fileUrl, filePath };
};
