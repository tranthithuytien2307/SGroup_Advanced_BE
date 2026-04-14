import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing R2 configuration");
}

export const r2BucketName = process.env.R2_BUCKET_NAME || "";
export const r2PublicBaseUrl = (
  process.env.R2_PUBLIC_BASE_URL || `${endpoint}/${r2BucketName}`
).replace(/\/+$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
