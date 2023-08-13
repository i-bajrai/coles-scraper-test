import { StackContext } from "sst/constructs";
import { Function } from "sst/constructs";
import { Bucket } from "sst/constructs";

export function API({ stack }: StackContext) {

  const scraperFunction = new Function(stack, "scraperFunction", {
    handler: "packages/functions/src/lambda.handler",
  });

  new Bucket(stack, "ColesScrapeBucket");

  scraperFunction.attachPermissions(["s3"]);
}
