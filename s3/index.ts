import * as aws from "@pulumi/aws";

const provider = new aws.Provider("provider", { region: "ap-southeast-1" });

const bucketName = "example";

export const bucket = new aws.s3.Bucket(
  bucketName,
  {
    bucket: bucketName,
    acl: "private",
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "AllowPutObjectForLambda",
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Action: "s3:PutObject",
          Resource: `arn:aws:s3:::${bucketName}/pdf/*`,
        },
        {
          Sid: "AllowGetObjectForLambda",
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucketName}/pdf/*`,
        },
      ],
    }),
  },
  { provider }
);
