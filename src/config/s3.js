import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.S3_REGION
const s3Client = new S3Client({ region: region });
export { s3Client };