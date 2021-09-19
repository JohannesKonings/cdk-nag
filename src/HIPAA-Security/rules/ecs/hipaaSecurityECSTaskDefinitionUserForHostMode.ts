/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnTaskDefinition, NetworkMode } from '@aws-cdk/aws-ecs';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Containers in ECS task definitions configured for host networking have 'privileged' set to true and a non-empty non-root 'user' - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnTaskDefinition) {
    if (node.networkMode === NetworkMode.HOST) {
      const containerDefinitions = Stack.of(node).resolve(
        node.containerDefinitions
      );
      if (containerDefinitions !== undefined) {
        for (const containerDefinition of containerDefinitions) {
          const resolvedDefinition =
            Stack.of(node).resolve(containerDefinition);
          const privileged = Stack.of(node).resolve(
            resolvedDefinition.privileged
          );
          const user = Stack.of(node).resolve(resolvedDefinition.user);
          if (privileged !== true || user === undefined) {
            return false;
          }
          const rootIdentifiers = ['root', '0'];
          const userParts = user.split(':');
          for (const userPart of userParts) {
            if (rootIdentifiers.includes(userPart.toLowerCase())) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
}