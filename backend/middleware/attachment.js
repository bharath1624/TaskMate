import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const attachement = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

export default attachement;
