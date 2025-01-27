// *** WARNING: this file was generated by pulumi-language-nodejs. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

import * as pulumiAws from "@pulumi/aws";

/**
 * The BucketComponent component offers a simple interface for creating an S3 bucket.
 */
export class BucketComponent extends pulumi.ComponentResource {
    /** @internal */
    public static readonly __pulumiType = 'flo-test:index:BucketComponent';

    /**
     * Returns true if the given object is an instance of BucketComponent.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    public static isInstance(obj: any): obj is BucketComponent {
        if (obj === undefined || obj === null) {
            return false;
        }
        return obj['__pulumiType'] === BucketComponent.__pulumiType;
    }

    /**
     * The underlying S3 Bucket resource.
     */
    public /*out*/ readonly bucket!: pulumi.Output<pulumiAws.s3.Bucket>;

    /**
     * Create a BucketComponent resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: BucketComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        let resourceInputs: pulumi.Inputs = {};
        opts = opts || {};
        if (!opts.id) {
            resourceInputs["bucket"] = undefined /*out*/;
        } else {
            resourceInputs["bucket"] = undefined /*out*/;
        }
        opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts);
        super(BucketComponent.__pulumiType, name, resourceInputs, opts, true /*remote*/);
    }
}

/**
 * The set of arguments for constructing a BucketComponent resource.
 */
export interface BucketComponentArgs {
}
