import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  },
});
