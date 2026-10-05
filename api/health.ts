/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

/**
 * Health check endpoint for the MAS SORA serverless gateway.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MAS SORA Gateway',
    environment: process.env.NODE_ENV || 'development',
    hasMasKeyId: Boolean(process.env.MAS_KEY_ID),
  });
}
