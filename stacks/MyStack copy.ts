import * as sst from "@serverless-stack/resources";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const scraperFunction = new lambda.Function(this, "scraperFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "lambda.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../packages/functions/src")),
      timeout: lambda.Duration.minutes(5),
      memorySize: 256,
    });


    const bucket = new sst.Bucket(this, "ColesScrapeBucket", {
      s3Bucket: {
        removalPolicy: "DESTROY",
      },
    });

    return {
      BucketName: bucket.s3Bucket.bucketName,
    }
  }
}


import { StackContext, Api, EventBus } from "sst/constructs";

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [bus],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /todo": "packages/functions/src/todo.list",
      "POST /todo": "packages/functions/src/todo.create",
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
