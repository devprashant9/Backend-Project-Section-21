import { v2 as cloudinary } from "cloudinary";
import envConfig from "./env.js";
import StandardError from "../utils/StandardError.js";

cloudinary.config({
    cloud_name: envConfig.cloudinary.cloudName,
    api_key: envConfig.cloudinary.apiKey,
    api_secret: envConfig.cloudinary.apiSecret,
});

// Upload buffer to Cloudinary using upload_stream
export const uploadUserAvatar = (fileBuffer, folder = "uploads") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [
                    { width: 500, height: 500, crop: "fill", gravity: "face" }
                ]
            },
            (error, result) => {
                if (error) {
                    return reject(new StandardError(500, "Failed to Upload Image", error.message));
                }
                resolve(result);
            }
        );

        // Write buffer to the upload stream
        uploadStream.end(fileBuffer);
    });
};

export const deleteUserAvatar = async (publicId) => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new StandardError(500, "Failed to Delete Image", error.message);
    }
};
