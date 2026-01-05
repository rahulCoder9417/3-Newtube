import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("🔵 [CLOUDINARY] Starting upload...");
        console.log("🔵 [CLOUDINARY] Local file path:", localFilePath);
        console.log("🔵 [CLOUDINARY] File exists:", fs.existsSync(localFilePath));
        
        if (!localFilePath) {
            console.log("❌ [CLOUDINARY] No local file path provided");
            return null;
        }
        
        // Check file size
        const stats = fs.statSync(localFilePath);
        console.log("🔵 [CLOUDINARY] File size:", (stats.size / 1024 / 1024).toFixed(2), "MB");
        
        console.log("🔵 [CLOUDINARY] Uploading to Cloudinary...");
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        console.log("✅ [CLOUDINARY] Upload successful!");
        console.log("✅ [CLOUDINARY] URL:", response.url);
        console.log("✅ [CLOUDINARY] Public ID:", response.public_id);
        
        fs.unlinkSync(localFilePath);
        console.log("✅ [CLOUDINARY] Local file cleaned up");
        
        return response;

    } catch (error) {
        console.error("❌ [CLOUDINARY] Upload failed!");
        console.error("❌ [CLOUDINARY] Error:", error.message);
        console.error("❌ [CLOUDINARY] Stack:", error.stack);
        
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("🧹 [CLOUDINARY] Cleaned up failed upload file");
        }
        return null;
    }
}

const deleteImageFromCloudinary = async(url,rt="image") =>{
    try {
        console.log("🔵 [CLOUDINARY DELETE] Deleting:", url);
        const filename = url.split('/').pop().split('.')[0];
        
        await cloudinary.api.delete_resources([filename], 
            { type: 'upload', resource_type: rt });
        
        console.log("✅ [CLOUDINARY DELETE] Deleted successfully");
    } catch (error) {
        console.error("❌ [CLOUDINARY DELETE] Error:", error.message);
        throw new ApiError(400,"error while deleting")
    }
}

export {uploadOnCloudinary,deleteImageFromCloudinary}