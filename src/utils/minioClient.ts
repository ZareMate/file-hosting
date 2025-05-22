import { Client } from "minio";
import { env } from "~/env";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT, 10),
  useSSL: true, // Set to true if using HTTPS
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

// Ensure the bucket exists
export async function ensureBucketExists(bucketName: string) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`Bucket "${bucketName}" created.`);
  }
}