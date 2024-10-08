# pulumi-get-function-across-mlc-repro

We were having issues with exposing the results of `.get` functions across component boundaries in Pulumi MLCs.
This is a minimal MLC provider and test program showing that issue.

The provider has two resources: `BucketComponent` & `BucketObjectComponent`. The `BucketComponent` creates an S3
bucket and then calls `.get` with its id to retrieve the same bucket.
`BucketObjectComponent` takes the `BucketComponent` as an input and uses its exported `bucket` to upload an
object to that S3 Bucket.

To run the repro yourself do the following:
- compile & link SDK:
```
cd sdk/nodejs/ && \
    yarn install && \
    yarn run tsc --version && \
    yarn run tsc && \
    cp package.json package.json yarn.lock ./bin/ && \
    cd ../.. && yarn link --cwd sdk/nodejs/bin
```
- start provider: `npx ts-node index.ts` (Take note of the port number that's printed)
- run a preview against the pulumi program in `test-program`:
  - Note: you'll need aws credentials for this
  - Link the SDK: `yarn link @pulumi/flo-test`
  - Run: `PULUMI_DEBUG_GRPC="logs.jsonl" PULUMI_DEBUG_PROVIDERS="flo-test:${PORT_NUMBER}" pulumi preview`
  - Observe the following error:
```
error: Running program '/Users/flo/development/component-get-issues/test-program/index.ts' failed with an unhandled exception:
    <ref *1> Error: failed to register new resource florian-object [flo-test:index:BucketObjectComponent]: 2 UNKNOWN: invocation of pulumi:pulumi:getResource returned an error: unknown resource urn:pulumi:component-get-issues::component-get-issues::aws:s3/bucket:Bucket::florian-bucket-retrieved
        at Object.registerResource (/Users/flo/development/component-get-issues/sdk/nodejs/node_modules/@pulumi/runtime/resource.ts:509:27)
        at new Resource (/Users/flo/development/component-get-issues/sdk/nodejs/node_modules/@pulumi/resource.ts:556:13)
        at new ComponentResource (/Users/flo/development/component-get-issues/sdk/nodejs/node_modules/@pulumi/resource.ts:1228:9)
        at new BucketObjectComponent (/Users/flo/development/component-get-issues/sdk/nodejs/bucketObjectComponent.ts:62:9)
        at Object.<anonymous> (/Users/flo/development/component-get-issues/test-program/index.ts:6:16)
        at Module._compile (node:internal/modules/cjs/loader:1364:14)
        at Module.m._compile (/Users/flo/development/component-get-issues/test-program/node_modules/@pulumi/pulumi/vendor/ts-node@7.0.1/index.js:3009:23)
        at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
        at Object.require.extensions.<computed> [as .ts] (/Users/flo/development/component-get-issues/test-program/node_modules/@pulumi/pulumi/vendor/ts-node@7.0.1/index.js:3011:12)
        at Module.load (node:internal/modules/cjs/loader:1203:32) {
      promise: Promise { <rejected> [Circular *1] }
    }
    error: Error: invocation of pulumi:pulumi:getResource returned an error: unknown resource urn:pulumi:component-get-issues::component-get-issues::aws:s3/bucket:Bucket::florian-bucket-retrieved
        at Object.callback (/Users/flo/development/component-get-issues/node_modules/@pulumi/runtime/resource.ts:231:52)
        at Object.onReceiveStatus (/Users/flo/development/component-get-issues/node_modules/@grpc/grpc-js/src/client.ts:360:26)
        at Object.onReceiveStatus (/Users/flo/development/component-get-issues/node_modules/@grpc/grpc-js/src/client-interceptors.ts:458:34)
        at Object.onReceiveStatus (/Users/flo/development/component-get-issues/node_modules/@grpc/grpc-js/src/client-interceptors.ts:419:48)
        at /Users/flo/development/component-get-issues/node_modules/@grpc/grpc-js/src/resolving-call.ts:163:24
        at processTicksAndRejections (node:internal/process/task_queues:77:11)
```
