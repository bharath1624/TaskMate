import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Helper: decide resource_type per mimetype ───────────────────────────────
// Cloudinary resource_type rules:
//   "image"  → jpg, png, gif, webp, svg
//   "raw"    → pdf, doc, docx, xls, xlsx, ppt, pptx, txt, CSV and all others
// Using "auto" causes CSV/TXT uploads to fail silently
const getResourceType = (mimetype) => {
    if (mimetype.startsWith("image/")) return "image";
    return "raw";   // PDFs, Office docs, text, CSV — all go as raw
};

// ─── Profile picture storage (images only) ───────────────────────────────────
export const profilePictureStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "taskmate/profile-pictures",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 400, height: 400, crop: "fill" }],
    },
});

// ─── Attachment storage (all file types) ─────────────────────────────────────
// ─── Attachment storage (all file types) ─────────────────────────────────────
export const attachmentStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // 1. Safely extract the exact extension
        const ext = file.originalname.split('.').pop().toLowerCase();

        // 2. Safely get the filename WITHOUT the extension
        const nameWithoutExt = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;

        // 3. Clean the name
        const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 80);

        return {
            folder: "taskmate/attachments",
            resource_type: getResourceType(file.mimetype),
            format: ext, // Tell Cloudinary the exact extension to use
            public_id: `${Date.now()}-${cleanName}`,
        };
    },
});

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_TYPES = new Set([
    // Images
    "image/jpeg", "image/jpg", "image/png",
    "image/gif", "image/webp", "image/svg+xml",
    // PDF
    "application/pdf",
    // Word
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Excel
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // PowerPoint
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text / CSV
    "text/plain",
    "text/csv",
    "application/csv",               // some browsers send this for .csv
    "application/vnd.ms-excel",      // some browsers send this for .csv too
]);

// ─── Multer instances ─────────────────────────────────────────────────────────
export const uploadProfilePicture = multer({
    storage: profilePictureStorage,
    limits: { fileSize: 2 * 1024 * 1024 },   // 2 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image files are allowed"), false);
    },
});

export const uploadAttachment = multer({
    storage: attachmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
        // Also allow by extension as fallback (browsers sometimes send wrong MIME)
        const ext = file.originalname.split(".").pop()?.toLowerCase();
        const allowedExts = new Set([
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"
        ]);
        if (allowedExts.has(ext || "")) return cb(null, true);
        cb(new Error(
            `File type not supported. Allowed: Images, PDF, Word, Excel, PowerPoint, TXT, CSV`
        ), false);
    },
});

export default cloudinary;