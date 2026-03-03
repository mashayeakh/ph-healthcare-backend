import { NextFunction, Request, RequestHandler, Response } from "express";

import { count } from "node:console";
import { SpecialtyService } from "./specialty.service";
import { catchAsyc } from "../../shared/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { cloudinaryUpload } from "../../config/cloudinary.config";

export const SpecialtyController = {

    //!create specialty

    specialtyCreate: catchAsyc(
        async (req: Request, res: Response) => {
            console.log("----REEEEED Body ", req.body)
            console.log("FILE:", req.file);
            console.log("BODY:", req.body);
            const created = await SpecialtyService.createSpecialty(req.body);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Specialty created successfully!!",
                // result:created
            })
        }
    ),


    // specialtyCreate: catchAsyc(async (req, res) => {
    // if (!req.file) throw new Error("File not provided");

    // const result = await new Promise((resolve, reject) => {
    //     const stream = cloudinaryUpload.uploader.upload_stream(
    //         { folder: "ph-healthcare/images" },
    //         (error, result) => {
    //             if (error) return reject(error);
    //             resolve(result);
    //         }
    //     );

    //     if (!req.file || !req.file.buffer) return reject(new Error("File buffer is empty"));

    //     streamifier.createReadStream(req.file.buffer).pipe(stream);
    // });

    // console.log(result);

    // res.json(result);


    // specialtyCreate: async (req: Request, res: Response) => {
    //     try {
    //         // Log 1: Basic request info
    //         console.log("========== REQUEST DEBUG INFO ==========");
    //         console.log("1. Request Method:", req.method);
    //         console.log("2. Request URL:", req.url);
    //         console.log("3. Request Headers:", JSON.stringify(req.headers, null, 2));
    //         console.log("4. Content-Type:", req.headers['content-type']);

    //         // Log 2: Body information
    //         console.log("\n========== BODY DEBUG INFO ==========");
    //         console.log("5. Raw req.body type:", typeof req.body);
    //         console.log("6. Is req.body empty?", Object.keys(req.body).length === 0);
    //         console.log("7. req.body keys:", Object.keys(req.body));
    //         console.log("8. Full req.body:", JSON.stringify(req.body, null, 2));

    //         // Log 3: Check for specific fields
    //         console.log("\n========== FIELD DEBUG INFO ==========");
    //         console.log("9. title field exists:", req.body.hasOwnProperty('title'));
    //         console.log("10. title value:", req.body.title);
    //         console.log("11. data field exists:", req.body.hasOwnProperty('data'));
    //         console.log("12. data value:", req.body.data);

    //         // Log 4: Try to parse if data exists
    //         if (req.body.data) {
    //             try {
    //                 const parsedData = JSON.parse(req.body.data);
    //                 console.log("\n========== PARSED DATA DEBUG INFO ==========");
    //                 console.log("13. Parsed data type:", typeof parsedData);
    //                 console.log("14. Parsed data keys:", Object.keys(parsedData));
    //                 console.log("15. Parsed data:", JSON.stringify(parsedData, null, 2));
    //                 console.log("16. Parsed title:", parsedData.title);
    //             } catch (parseError: any) {
    //                 console.log("17. Failed to parse data field:", parseError.message);
    //             }
    //         }

    //         // Log 5: File information
    //         console.log("\n========== FILE DEBUG INFO ==========");
    //         console.log("18. req.file exists:", !!req.file);
    //         if (req.file) {
    //             console.log("19. File fieldname:", req.file.fieldname);
    //             console.log("20. Original filename:", req.file.originalname);
    //             console.log("21. File mimetype:", req.file.mimetype);
    //             console.log("22. File size:", req.file.size);
    //             console.log("23. File path:", req.file.path);
    //             console.log("24. File destination:", req.file.destination);
    //             console.log("25. File filename:", req.file.filename);
    //             console.log("26. File buffer exists:", !!req.file.buffer);
    //             console.log("27. Full file object:", JSON.stringify(req.file, (key, value) => {
    //                 // Don't log buffer as it's too large
    //                 if (key === 'buffer') return 'Buffer(' + value.length + ' bytes)';
    //                 return value;
    //             }, 2));
    //         }

    //         // Log 6: Multer specific info
    //         console.log("\n========== MULTER DEBUG INFO ==========");
    //         console.log("28. Is multipart/form-data?", req.headers['content-type']?.includes('multipart/form-data'));
    //         console.log("29. req.files exists (multiple files):", !!req.files);

    //         // Log 7: Cloudinary config check (without exposing secrets)
    //         console.log("\n========== CLOUDINARY CONFIG CHECK ==========");
    //         console.log("30. Cloud name exists:", !!process.env.CLOUDINARY_CLOUD_NAME);
    //         console.log("31. API Key exists:", !!process.env.CLOUDINARY_API_KEY);
    //         console.log("32. API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

    //         // Log 8: Environment check
    //         console.log("\n========== ENVIRONMENT INFO ==========");
    //         console.log("33. NODE_ENV:", process.env.NODE_ENV);
    //         console.log("34. Current working directory:", process.cwd());

    //         // Try to manually parse form-data if needed
    //         console.log("\n========== MANUAL PARSING ATTEMPT ==========");
    //         let processedBody = req.body;

    //         // Case 1: If data is sent as JSON string
    //         if (req.body.data && typeof req.body.data === 'string') {
    //             try {
    //                 processedBody = JSON.parse(req.body.data);
    //                 console.log("35. Successfully parsed data string to JSON");
    //                 console.log("36. Parsed body:", processedBody);
    //             } catch (e: any) {
    //                 console.log("35. Failed to parse data string:", e.message);
    //             }
    //         }

    //         // Case 2: If fields are nested under a key
    //         if (req.body.specialty && typeof req.body.specialty === 'string') {
    //             try {
    //                 processedBody = JSON.parse(req.body.specialty);
    //                 console.log("37. Successfully parsed specialty string to JSON");
    //                 console.log("38. Parsed body:", processedBody);
    //             } catch (e: any) {
    //                 console.log("37. Failed to parse specialty string:", e.message);
    //             }
    //         }

    //         // Final processed body
    //         console.log("\n========== FINAL PROCESSED BODY ==========");
    //         console.log("39. Processed body for service:", JSON.stringify(processedBody, null, 2));

    //         // Test Cloudinary connection
    //         if (req.file) {
    //             console.log("\n========== TESTING CLOUDINARY UPLOAD ==========");
    //             try {
    //                 // Try a simple upload test
    //                 const cloudinary = require('cloudinary').v2;
    //                 cloudinary.config({
    //                     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //                     api_key: process.env.CLOUDINARY_API_KEY,
    //                     api_secret: process.env.CLOUDINARY_API_SECRET
    //                 });

    //                 console.log("40. Cloudinary configured, attempting test...");

    //                 // This is just a test to verify credentials, not actual upload
    //                 const apiResponse = await cloudinary.api.ping();
    //                 console.log("41. Cloudinary ping successful:", apiResponse);

    //             } catch (cloudinaryError: any) {
    //                 console.log("40. Cloudinary test failed:", cloudinaryError.message);
    //                 if (cloudinaryError.http_code) {
    //                     console.log("41. Cloudinary HTTP code:", cloudinaryError.http_code);
    //                 }
    //                 console.log("42. Full error:", cloudinaryError);
    //             }
    //         }

    //         console.log("\n========== END DEBUG INFO ==========");

    //         // Uncomment when ready to actually create
    //         // const created = await SpecialtyService.createSpecialty(processedBody);

    //         res.status(200).json({
    //             success: true,
    //             message: "Debug info logged successfully",
    //             debug: {
    //                 bodyReceived: req.body,
    //                 fileReceived: !!req.file,
    //                 processedBody: processedBody,
    //                 contentType: req.headers['content-type']
    //             }
    //         });

    //     } catch (error: any) {
    //         console.error("\n========== ERROR IN CONTROLLER ==========");
    //         console.error("Error name:", error.name);
    //         console.error("Error message:", error.message);
    //         console.error("Full error:", error);

    //         res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error",
    //             error: {
    //                 name: error.name,
    //                 message: error.message,
    //                 stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    //             }
    //         });
    //     }
    // },


    //!get specialty
    getAllSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            const _result = await SpecialtyService.getAllSpecialty()

            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: "Specialty fetched successfully!!",
                result: {
                    count: _result.length,
                    data: _result
                }
            })
        }
    ),


    //!delete specialty
    deleteSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            // const result = await SpecialtyService.deleteSepcialty(req.params.id as string)
            res.status(status.OK).json({
                success: true,
                message: "Specialty deleted Succesfully",
                data: await SpecialtyService.deleteSepcialty(req.params.id as string)
            })

        }
    ),


    //!edit specialty
    editSpecialty: catchAsyc(
        async (req: Request, res: Response) => {
            const payload = req.body;
            const { id } = req.params;
            console.log("specialty to be edited", payload);
            console.log("specialty id found", id);
            res.status(status.OK).json({
                success: true,
                message: "Edited successfully",
                data: await SpecialtyService.editSpecialty(id as string, payload)
            })
        }
    )
};
