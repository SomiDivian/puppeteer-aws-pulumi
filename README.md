# What's in here

- AWS: Amazon cloud provider

- Pulumi: Infrastructure as Code for Engineers

# Notes

- This is a simple service: simple authentication were used, no queue, no streaming

# Setup Pulumi

- To create a new project

```cli
mkdir my-project && cd my-project && pulumi new
```

then Pulumi will walk you through the setup of your project

- Install pdf generation dependencies

```cli
npm install @sparticuz/chromium-min puppeteer-core generic-pool
```

we used [@frimuchkov/hpdf](https://github.com/frimuchkov/hpdf) source code in combination with [@sparticuz/chromium](https://github.com/Sparticuz/chromium)

you need to host [chromium-v110.0.1-pack.tar](https://github.com/Sparticuz/chromium/releases) in a separate bucket in your s3 account, then add the public url to the `s3FilePath` variable in `lambda/generate-pdf.ts`

also don't forget to set `ALLOWED_SECRET` in `lambda/index.ts` to a random string

you may need to add this to your `tsconfig.ts`

```json
...
+    "esModuleInterop": true,
...
```

# Deployment

```cli
pulumi up
```

the deployment will take a while, then return a url to your service
