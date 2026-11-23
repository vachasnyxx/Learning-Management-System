import multer from "multer";
import path from "path";

/**
 * @upload - Middleware to handle file uploads using multer.
 * The configuration sets the file size limit, file storage location, and file filter for allowed file types.
 */
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".webp",
      ".png",
      ".gif",
      ".svg",
      ".mp4",
      ".pdf",
      ".ppt",
      ".pptx",
      ".doc",
      ".docx",
      ".txt",
      ".zip",
    ];

    if (!allowedExtensions.includes(ext)) {
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }

    cb(null, true);
  },
});

export default upload;
