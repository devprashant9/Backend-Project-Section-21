import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ----------------------
// Helper: File Type Validators with Error Handling
// ----------------------
const imageFileFilter = (req, file, cb) => {
    try {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;

        if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed!"), false);
        }
    } catch (err) {
        cb(err);
    }
};

const videoFileFilter = (req, file, cb) => {
    try {
        const allowedTypes = /mp4|mov|avi|mkv/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = file.mimetype;

        if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only video files are allowed!"), false);
        }
    } catch (err) {
        cb(err);
    }
};

// ----------------------
// Disk Storage Setup with Error Handling
// ----------------------
const diskStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const dir = path.join(process.cwd(), folder);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            } catch (err) {
                cb(err);
            }
        },
        filename: (req, file, cb) => {
            try {
                const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            } catch (err) {
                cb(err);
            }
        },
    });

// ----------------------
// Memory Storage Setup
// ----------------------
const memoryStorage = multer.memoryStorage();

// ----------------------
// Multer Instances
// ----------------------
export const uploadImageDisk = multer({
    storage: diskStorage("uploads/images"),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadImageMemory = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadVideoDisk = multer({
    storage: diskStorage("uploads/videos"),
    fileFilter: videoFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export const uploadVideoMemory = multer({
    storage: memoryStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// ----------------------
// Global Upload Error Handler Middleware
// ----------------------
export const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large!" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // Handle general errors
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
    next();
};