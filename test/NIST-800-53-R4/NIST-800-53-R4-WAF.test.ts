/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnWebACL, CfnLoggingConfiguration } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('AWS WAF - Web Application Firewall', () => {
  test('NIST.800.53.R4-WAFv2LoggingEnabled: - WAFv2 web ACLs have logging enabled - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c), SC-7, SI-4(a)(b)(c)).', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new CfnWebACL(nonCompliant, 'rWebACL', {
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-WAFv2LoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    const compliantWebAcl1 = new CfnWebACL(compliant, 'rWebACL', {
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    new CfnLoggingConfiguration(compliant, 'rLoggingConfig1', {
      resourceArn: compliantWebAcl1.attrArn,
      logDestinationConfigs: [],
    });
    const compliantWebAcl2 = new CfnWebACL(compliant, 'rWebACL2', {
      name: 'foo',
      defaultAction: {
        allow: {
          customRequestHandling: {
            insertHeaders: [
              {
                name: 'AllowActionHeader1Name',
                value: 'AllowActionHeader1Value',
              },
            ],
          },
        },
      },
      scope: 'REGIONAL',
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'foo',
      },
    });
    new CfnLoggingConfiguration(compliant, 'rLoggingConfig2', {
      resourceArn: `arn:aws:wafv2:us-east-1:123456789000:regional/webacl/${compliantWebAcl2.name}`,
      logDestinationConfigs: [],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-WAFv2LoggingEnabled:'),
        }),
      })
    );
  });
});