// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { cloudinaryUpload } from "./cloudinary.config";
// import multer from "multer";

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinaryUpload,
//     params: async (req, file) => {
//         const originalName = file.originalname;

//         //get the file extension
//         const fileExtension = originalName
//             .split(".")
//             .pop()
//             ?.toLowerCase();

//         //get the file name without extension
//         const fileNameWithoutExtension = originalName
//             .split(".")
//             .slice(0, -1)
//             .join(".")
//             .toLowerCase()
//             .replace(/\s+/g, "-")
//             .replace(/[^a-z0-9\-]/g, "")// my##file.jpg => my-file.jpg => myfile.jpg

//         //set an unique file name so that it does not match with others or override any 
//         const uniqueName = Math
//             .random()
//             .toString(36)
//             .substring(2)
//             + "-" +
//             Date.now()
//             + "-" +
//             fileNameWithoutExtension

//         //folder for the uploaded files in cloudinary
//         const folder = fileExtension === "pdf" ? "pdfs" : "images";



//         return {
//             folder: `ph-healthcare/${folder}`,
//             public_id: uniqueName,
//             resource_type: "auto",
//         }


//     }
// })

// export const multerUpload = multer({ storage })





import multer from "multer";

export const multerUpload = multer({
    storage: multer.memoryStorage(),
});