import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { readFileSync } from "fs";
import { parse } from "yaml";

export class Provider implements pulumi.provider.Provider {

    constructor(readonly version: string, readonly schema: string) {
        // Register any resources that can come back as resource references that need to be rehydrated.
        pulumi.runtime.registerResourceModule("flo-test", "index", {
            version: version,
            construct: (name, type, urn) => {
                switch (type) {
                    case "flo-test:index:BucketComponent":
                        return new BucketComponent(name, undefined, { urn });
                    case "flo-test:index:BucketObjectComponent":
                        return new BucketObjectComponent(name, undefined, { urn });
                    default:
                        throw new Error(`unknown resource type ${type}`);
                }
            },
        });
    }
  
    async construct(
      name: string,
      type: string,
      inputs: pulumi.Inputs,
      options: pulumi.ComponentResourceOptions
    ): Promise<pulumi.provider.ConstructResult> {
      switch (type) {
        case "flo-test:index:BucketComponent":
          return await constructBucket(name, inputs, options);
        case "flo-test:index:BucketObjectComponent":
          return await constructBucketObject(name, inputs, options);
        default:
          throw new Error(`unknown resource type ${type}`);
      }
    }
  }
  
  async function constructBucket(
    name: string,
    inputs: pulumi.Inputs,
    options: pulumi.ComponentResourceOptions
  ): Promise<pulumi.provider.ConstructResult> {
    // Create the component resource.
    const bucket = new BucketComponent(name, inputs as any, options);
  
    // Return the component resource's URN and outputs as its state.
    return {
      urn: bucket.urn,
      state: {
        bucket: bucket.bucket,
      },
    };
  }

  async function constructBucketObject(
    name: string,
    inputs: pulumi.Inputs,
    options: pulumi.ComponentResourceOptions
  ): Promise<pulumi.provider.ConstructResult> {
    // Create the component resource.
    const bucket = new BucketObjectComponent(name, inputs as any, options);
  
    // Return the component resource's URN and outputs as its state.
    return {
      urn: bucket.urn,
      state: {
        bucketObject: bucket.bucketObject,
      },
    };
  }

export function main(args: string[]) {
    const file: string = readFileSync("./schema.yaml", "utf8");

    const schema = JSON.stringify(parse(file));
    return pulumi.provider.main(new Provider("1.0.0", schema), args);
}

export function testProviderFactory(): pulumi.provider.Provider {
    return testProvider;
}

const testProvider: pulumi.provider.Provider = {
    construct: (
        name: string,
        type: string,
        inputs: pulumi.Inputs,
        options: pulumi.ComponentResourceOptions,
    ) => {
        try {
            const comp = new BucketComponent(name, inputs, options);
            return Promise.resolve({
                urn: comp.urn,
                state: {
                    bucket: comp.bucket
                },
            });
        } catch (e) {
            return Promise.reject(e);
        }
    },
    version: "", // ignored
};

class BucketComponent extends pulumi.ComponentResource {
    public readonly bucket!: pulumi.Output<aws.s3.Bucket>;

    constructor(name: string, args?: { }, opts?: pulumi.ComponentResourceOptions) {
        if (opts?.urn) {
            const props = {
                bucket: undefined,
            };
            super("flo-test:index:BucketComponent", name, props, opts);
            return;
        }

        super("flo-test:index:BucketComponent", name, args, opts);

        const bucket = new aws.s3.Bucket(name, {
            forceDestroy: true,
        }, { parent: this });
        this.bucket = pulumi.output(aws.s3.Bucket.get(`${name}-retrieved`, bucket.id));

        this.registerOutputs({
            bucket: this.bucket,
        });
    }
}

class BucketObjectComponent extends pulumi.ComponentResource {
    public readonly bucketObject!: aws.s3.BucketObject; 

    constructor(name: string, args?: {
        bucketComponent: BucketComponent,
        key: string,
        value: string,
    }, opts?: pulumi.ComponentResourceOptions) {
        if (opts?.urn) {
            const props = {
                bucketObject: undefined,
            };
            super("flo-test:index:BucketObjectComponent", name, props, opts);
            return;
        }

        super("flo-test:index:BucketObjectComponent", name, args, opts);

        this.bucketObject = new aws.s3.BucketObject("object", {
            bucket: args!.bucketComponent.bucket,
            key: "object",
            source: new pulumi.asset.StringAsset("hello world"),
        }, { parent: this });

        this.registerOutputs({
            bucketObject: this.bucketObject,
        });
    }
}

main(process.argv.slice(2));

// const bucket = new BucketComponent("florian-bucket");
// const object = new BucketObjectComponent("florian-object", {
//     bucketComponent: bucket,
//     key: "index",
//     value: "Hello world!",
// });

// export const bucketName = bucket.bucket.id;
