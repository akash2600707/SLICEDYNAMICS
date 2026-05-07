import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Uncomment for Cloudflare R2:
  // endpoint: process.env.AWS_ENDPOINT_URL,
  // forcePathStyle: true,
});

const BUCKET = process.env.AWS_BUCKET_NAME!;

export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 300 // 5 minutes
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function generateDownloadPresignedUrl(
  key: string,
  expiresIn = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteS3Object(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function buildStorageKey(orderId: string, fileName: string, version = 1): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `orders/${orderId}/v${version}/${Date.now()}_${sanitized}`;
}

// Allowed 3D file types
export const ALLOWED_3D_TYPES: Record<string, string> = {
  "model/stl": ".stl",
  "application/sla": ".stl",
  "application/octet-stream": ".stl/.obj/.step/.stp",
  "model/obj": ".obj",
  "application/step": ".step",
};

export const ALLOWED_EXTENSIONS = [".stl", ".obj", ".step", ".stp", ".3mf"];

export function isAllowed3DFile(fileName: string): boolean {
  const ext = "." + fileName.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}
