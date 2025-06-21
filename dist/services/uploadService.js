"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = exports.upload = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const s3Config = {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
    endpoint: process.env.MINIO_ENDPOINT, // MinIO endpoint for local dev.
    s3ForcePathStyle: true, // Required for MinIO.
    signatureVersion: "v4",
};
// Check if we are in production to use actual AWS S3.
if (process.env.NODE_ENV === "production") {
    // In production, remove MinIO-specific config and potentially set region.
    delete s3Config.endpoint;
    delete s3Config.s3ForcePathStyle;
    s3Config.region = process.env.AWS_REGION; // e.g., 'us-east-1'
    s3Config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    s3Config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}
const s3 = new aws_sdk_1.default.S3(s3Config);
// Multer storage for memory (to pass buffer to S3)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
exports.upload = upload;
// Function to upload file to S3/MinIO
const uploadFileToS3 = async (fileBuffer, originalname, mimetype, bucketName) => {
    const fileExtension = path_1.default.extname(originalname);
    const fileName = `${(0, uuid_1.v4)()}${fileExtension}`; // Generate a unique name
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: "public-read", // Make the file publicly accessible
    };
    try {
        const data = await s3.upload(params).promise();
        return data.Location; // Returns the URL of the uploaded file
    }
    catch (error) {
        // Type 'any' for caught error is often necessary for now
        console.error("Error uploading file to S3/MinIO:", error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};
exports.uploadFileToS3 = uploadFileToS3;
//# sourceMappingURL=uploadService.js.map