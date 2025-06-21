import AWS from "aws-sdk";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3Config: AWS.S3.ClientConfiguration = {
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

const s3 = new AWS.S3(s3Config);

// Multer storage for memory (to pass buffer to S3)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to upload file to S3/MinIO
const uploadFileToS3 = async (
  fileBuffer: Buffer,
  originalname: string,
  mimetype: string,
  bucketName: string
): Promise<string> => {
  const fileExtension = path.extname(originalname);
  const fileName = `${uuidv4()}${fileExtension}`; // Generate a unique name

  const params: AWS.S3.PutObjectRequest = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: "public-read", // Make the file publicly accessible
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Returns the URL of the uploaded file
  } catch (error: any) {
    // Type 'any' for caught error is often necessary for now
    console.error("Error uploading file to S3/MinIO:", error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export {
  upload, // Multer middleware
  uploadFileToS3,
};
