import * as aws from "@pulumi/aws";

// s3
import { bucket } from "../s3";
// import * as cloud from "@pulumi/cloud-aws";

// pdf generator
import type { PDFOptions } from "puppeteer-core";
import { PdfGenerator } from "./generate-pdf";

const ALLOWED_SECRET = "";
// a single user auth 😅

// generates a pdf using puppeteer
const generatePdf = async (
  content: string | URL,
  options: PDFOptions
): Promise<Buffer> => {
  const generator = new PdfGenerator({ min: 1, max: 100 });

  const buffer = await generator.generatePDF(content, false, options);
  //                                                  ^^^^ stream: false

  return buffer;
};

// Define the authorizer lambder handler
const authLambda = new aws.lambda.CallbackFunction("auth", {
  callback: async (event, context) => {
    // --- Add your own custom authorization logic here. ---
    const effect =
      (event as any).headers?.Authorization === ALLOWED_SECRET
        ? "Allow"
        : "Deny";
    return {
      principalId: "my-user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: (event as any).methodArn,
          },
        ],
      },
    };
  },
});

// Create a PDF Lambda Function
const pdfHandler = new aws.lambda.CallbackFunction("pdf-handler", {
  callback: async (ev: any, ctx) => {
    const body = ev.isBase64Encoded
      ? Buffer.from(ev.body, "base64")?.toString()
      : ev.body;

    try {
      // 0. extract content and options from event
      const { content, options } = JSON.parse(body ?? "{}");

      const isURL = content?.startsWith("http");

      // 1. generate pdf
      let buffer: Buffer;
      if (isURL) {
        buffer = await generatePdf(new URL(content), options);
      } else {
        buffer = await generatePdf(content, options);
      }

      // 2. save to s3
      const name = `${Date.now()}.pdf`;
      const s3 = new aws.sdk.S3({ region: "ap-southeast-1" });
      await s3
        .putObject({
          Bucket: bucket.bucket.get(),
          Key: `pdf/${name}`,
          Body: buffer,
          ContentType: "application/pdf",
        })
        .promise();

      // 3. sign public url
      const signedUrl = await s3.getSignedUrlPromise("getObject", {
        Bucket: bucket.bucket.get(),
        Key: `pdf/${name}`,
        Expires: 60 * 60 * 24 * 30, // 30 days
      });

      // 4. return signed url
      return {
        statusCode: 200,
        body: signedUrl,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: (error as Error).message }),
      };
    }
  },
  timeout: 60,
  memorySize: 1024,
});

export { pdfHandler, authLambda };
