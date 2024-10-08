
import * as floTest from "@pulumi/flo-test";

const bucket = new floTest.BucketComponent("florian-bucket");
const object = new floTest.BucketObjectComponent("florian-object", {
    bucketComponent: bucket,
    key: "index",
    value: "Hello world!",
});

export const bucketName = bucket.bucket.id;
