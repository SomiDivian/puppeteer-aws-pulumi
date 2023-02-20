import * as apigateway from "@pulumi/aws-apigateway";

import { pdfHandler, authLambda } from "./lambda";

const api = new apigateway.RestAPI("api", {
  routes: [
    {
      path: "/pdf",
      method: "POST",
      eventHandler: pdfHandler,
      authorizers: [
        {
          authType: "custom",
          parameterName: "Authorization",
          type: "request",
          identitySource: ["method.request.header.Authorization"],
          // Delegate to the Lambda function defined above
          handler: authLambda,
        },
      ],
    },
  ],
});

export const url = api.url;
