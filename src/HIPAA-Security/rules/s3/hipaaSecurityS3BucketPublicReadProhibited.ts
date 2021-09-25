/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnBucket } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnBucket) {
    const publicAccessBlockConfiguration = Stack.of(node).resolve(
      node.publicAccessBlockConfiguration
    );
    if (
      publicAccessBlockConfiguration === undefined ||
      publicAccessBlockConfiguration.blockPublicPolicy !== true
    ) {
      return false;
    }
    const accessControl = Stack.of(node).resolve(node.accessControl);
    if (
      (accessControl === 'PublicRead' || accessControl === 'PublicReadWrite') &&
      publicAccessBlockConfiguration.blockPublicAcls !== true
    ) {
      return false;
    }
  }
  return true;
}