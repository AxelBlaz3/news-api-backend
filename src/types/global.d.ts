// This ensures that the types for `Request` are augmented globally
// when you import 'express'.
declare module "express" {
  interface Request {
    file?: import("multer").File; // For upload.single()
    files?:
      | {
          // For upload.fields() or upload.array()
          [fieldname: string]: import("multer").File[];
        }
      | import("multer").File[]; // For upload.array() without a field name
  }
}

// Define a more specific type for Multer file for clarity and to ensure properties
// Although Multer.File already has these, explicitly listing can sometimes help
// with complex type inference or minor version differences.
export interface UploadedFile extends Express.Multer.File {
  // Ensuring these properties are definitely here for convenience and type safety
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer; // This is added by memoryStorage
}
