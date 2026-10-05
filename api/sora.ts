/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response } from 'express';

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export interface NormalizedMASRate {
  date: string;
  sora: number;
  sora_1m?: number;
  sora_3m?: number;
  sora_6m?: number;
  sora_index?: number;
  volumeMillionSGD: number;
  dayCount: number;
}

/**
 * Serverless function to fetch MAS SORA overnight rates and compounded averages.
 * Requires MAS API Key provided via environment variable MAS_KEY_ID or request header.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');

  // Retrieve MAS KeyId from environment variable or request header
  const masKeyId =
    process.env.MAS_KEY_ID ||
    (req.headers['keyid'] as string) ||
    (req.headers['x-mas-key-id'] as string);

  if (!masKeyId) {
    return res.status(401).json({
      error: 'MAS_KEY_ID is missing or not configured',
      message:
        'Please set MAS_KEY_ID in your environment variables (.env) or pass the KeyId header to authenticate with the MAS API gateway.',
      configured: false,
    });
  }

  try {
    // Build query URL with forwardable query parameters (e.g. limit, sort, filters)
    const url = new URL(MAS_SORA_ENDPOINT);
    const query = req.query || {};

    // Forward known query params or provide sensible defaults
    if (query.limit) {
      url.searchParams.set('limit', String(query.limit));
    } else {
      url.searchParams.set('limit', '60');
    }

    if (query.sort) {
      url.searchParams.set('sort', String(query.sort));
    } else {
      url.searchParams.set('sort', 'end_of_day desc');
    }

    if (query.start) {
      url.searchParams.set('start', String(query.start));
    }

    if (query.end) {
      url.searchParams.set('end', String(query.end));
    }

    // Call MAS API Gateway with KeyId header
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `MAS API responded with status ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // MAS API responses can be an array of records or wrapped in result.records
    const rawRecords: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.result?.records)
      ? data.result.records
      : Array.isArray(data?.records)
      ? data.records
      : [];

    // Normalize MAS records for consistent consumption
    const normalized: NormalizedMASRate[] = rawRecords.map((rec: any) => {
      const rawDate = rec.end_of_day || rec.date || rec.observation_date || '';
      const dateObj = new Date(rawDate);
      const dayOfWeek = isNaN(dateObj.getDay()) ? 1 : dateObj.getDay();
      // Friday rate counts for 3 calendar days (Fri, Sat, Sun)
      const dayCount = dayOfWeek === 5 ? 3 : 1;

      return {
        date: rawDate,
        sora: parseFloat(rec.sora || rec.sora_val || rec.overnight_rate || '0'),
        sora_1m: rec.sora_compounded_1m
          ? parseFloat(rec.sora_compounded_1m)
          : rec.compounded_1m
          ? parseFloat(rec.compounded_1m)
          : undefined,
        sora_3m: rec.sora_compounded_3m
          ? parseFloat(rec.sora_compounded_3m)
          : rec.compounded_3m
          ? parseFloat(rec.compounded_3m)
          : undefined,
        sora_6m: rec.sora_compounded_6m
          ? parseFloat(rec.sora_compounded_6m)
          : rec.compounded_6m
          ? parseFloat(rec.compounded_6m)
          : undefined,
        sora_index: rec.sora_index ? parseFloat(rec.sora_index) : undefined,
        volumeMillionSGD: rec.aggregate_volume
          ? parseFloat(rec.aggregate_volume)
          : rec.volume
          ? parseFloat(rec.volume)
          : 0,
        dayCount,
      };
    });

    return res.status(200).json({
      success: true,
      total: normalized.length,
      records: normalized,
      raw: data,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to fetch from MAS API endpoint',
      message: err?.message || String(err),
    });
  }
}
