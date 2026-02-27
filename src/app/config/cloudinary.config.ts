// cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

// Configure cloudinary directly

console.log("Cloud name:", envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME);
console.log("API key:", envVars.CLOUDINARY.CLOUDINARY_API_KEY);
console.log("API secret:", envVars.CLOUDINARY.CLOUDINARY_API_SECRET);



cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
    // secure: true
});

// Test the configuration immediately
cloudinary.api.ping()
    .then(result => console.log("✅ Cloudinary connected successfully:", result))
    .catch(error => console.error("❌ Cloudinary connection failed:", error));

export const cloudinaryUpload = cloudinary;