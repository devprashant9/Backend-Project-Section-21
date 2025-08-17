import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ----------------------
// Helper: File Type Validators
// ----------------------
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed!"), false);
    }
};

const videoFileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only video files are allowed!"), false);
    }
};

// ----------------------
// Disk Storage Setup
// ----------------------
const diskStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(process.cwd(), folder);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
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
