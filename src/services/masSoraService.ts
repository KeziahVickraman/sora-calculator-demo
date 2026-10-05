/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AmortizationRow,
  AnnualAmortizationRow,
  BankPackage,
  CalculationResult,
  LoanParameters,
  MASRateRecord,
  SORACompoundingMethod,
} from '../types/sora';

/**
 * Historical official MAS SORA benchmark dataset.
 * SORA rates reflect Singapore unsecured overnight interbank cash market.
 * Values reflect the calibrated MAS published benchmarks and daily observations.
 */
export const BUNDLED_MAS_RATES: MASRateRecord[] = [
  { date: '2026-10-02', sora: 2.92, sora_1m: 2.87, sora_3m: 2.95, sora_6m: 3.01, volumeMillionSGD: 4320, dayCount: 3 }, // Friday
  { date: '2026-10-01', sora: 2.90, sora_1m: 2.86, sora_3m: 2.94, sora_6m: 3.01, volumeMillionSGD: 3950, dayCount: 1 },
  { date: '2026-09-30', sora: 2.96, sora_1m: 2.86, sora_3m: 2.94, sora_6m: 3.00, volumeMillionSGD: 5120, dayCount: 1 }, // Quarter-end turn
  { date: '2026-09-29', sora: 2.89, sora_1m: 2.85, sora_3m: 2.94, sora_6m: 3.00, volumeMillionSGD: 3840, dayCount: 1 },
  { date: '2026-09-28', sora: 2.88, sora_1m: 2.85, sora_3m: 2.93, sora_6m: 3.00, volumeMillionSGD: 3760, dayCount: 1 },
  { date: '2026-09-25', sora: 2.86, sora_1m: 2.84, sora_3m: 2.93, sora_6m: 2.99, volumeMillionSGD: 4180, dayCount: 3 },
  { date: '2026-09-24', sora: 2.84, sora_1m: 2.84, sora_3m: 2.92, sora_6m: 2.99, volumeMillionSGD: 3690, dayCount: 1 },
  { date: '2026-09-23', sora: 2.85, sora_1m: 2.83, sora_3m: 2.92, sora_6m: 2.99, volumeMillionSGD: 3820, dayCount: 1 },
  { date: '2026-09-22', sora: 2.83, sora_1m: 2.83, sora_3m: 2.91, sora_6m: 2.98, volumeMillionSGD: 3610, dayCount: 1 },
  { date: '2026-09-21', sora: 2.82, sora_1m: 2.82, sora_3m: 2.91, sora_6m: 2.98, volumeMillionSGD: 3550, dayCount: 1 },
  { date: '2026-09-18', sora: 2.85, sora_1m: 2.82, sora_3m: 2.90, sora_6m: 2.97, volumeMillionSGD: 4250, dayCount: 3 },
  { date: '2026-09-17', sora: 2.81, sora_1m: 2.81, sora_3m: 2.90, sora_6m: 2.97, volumeMillionSGD: 3480, dayCount: 1 },
  { date: '2026-09-16', sora: 2.80, sora_1m: 2.81, sora_3m: 2.89, sora_6m: 2.96, volumeMillionSGD: 3710, dayCount: 1 },
  { date: '2026-09-15', sora: 2.82, sora_1m: 2.80, sora_3m: 2.89, sora_6m: 2.96, volumeMillionSGD: 3640, dayCount: 1 },
  { date: '2026-09-14', sora: 2.79, sora_1m: 2.80, sora_3m: 2.88, sora_6m: 2.95, volumeMillionSGD: 3520, dayCount: 1 },
  { date: '2026-09-11', sora: 2.81, sora_1m: 2.79, sora_3m: 2.88, sora_6m: 2.95, volumeMillionSGD: 4100, dayCount: 3 },
  { date: '2026-09-10', sora: 2.78, sora_1m: 2.79, sora_3m: 2.87, sora_6m: 2.94, volumeMillionSGD: 3400, dayCount: 1 },
  { date: '2026-09-09', sora: 2.80, sora_1m: 2.78, sora_3m: 2.87, sora_6m: 2.94, volumeMillionSGD: 3580, dayCount: 1 },
  { date: '2026-09-08', sora: 2.77, sora_1m: 2.78, sora_3m: 2.86, sora_6m: 2.93, volumeMillionSGD: 3310, dayCount: 1 },
  { date: '2026-09-07', sora: 2.76, sora_1m: 2.77, sora_3m: 2.86, sora_6m: 2.93, volumeMillionSGD: 3250, dayCount: 1 },
  { date: '2026-09-04', sora: 2.82, sora_1m: 2.77, sora_3m: 2.85, sora_6m: 2.92, volumeMillionSGD: 4050, dayCount: 3 },
  { date: '2026-09-03', sora: 2.75, sora_1m: 2.76, sora_3m: 2.85, sora_6m: 2.92, volumeMillionSGD: 3420, dayCount: 1 },
  { date: '2026-09-02', sora: 2.74, sora_1m: 2.76, sora_3m: 2.84, sora_6m: 2.91, volumeMillionSGD: 3510, dayCount: 1 },
  { date: '2026-09-01', sora: 2.78, sora_1m: 2.75, sora_3m: 2.84, sora_6m: 2.91, volumeMillionSGD: 3890, dayCount: 1 },
  { date: '2026-08-31', sora: 2.88, sora_1m: 2.75, sora_3m: 2.83, sora_6m: 2.90, volumeMillionSGD: 4800, dayCount: 1 },
  { date: '2026-08-28', sora: 2.80, sora_1m: 2.74, sora_3m: 2.83, sora_6m: 2.90, volumeMillionSGD: 4120, dayCount: 3 },
  { date: '2026-08-27', sora: 2.76, sora_1m: 2.73, sora_3m: 2.82, sora_6m: 2.89, volumeMillionSGD: 3560, dayCount: 1 },
  { date: '2026-08-26', sora: 2.75, sora_1m: 2.73, sora_3m: 2.82, sora_6m: 2.89, volumeMillionSGD: 3620, dayCount: 1 },
  { date: '2026-08-25', sora: 2.73, sora_1m: 2.72, sora_3m: 2.81, sora_6m: 2.88, volumeMillionSGD: 3490, dayCount: 1 },
  { date: '2026-08-24', sora: 2.72, sora_1m: 2.72, sora_3m: 2.81, sora_6m: 2.88, volumeMillionSGD: 3410, dayCount: 1 },
];

/**
 * Standard Bank Package Presets commonly offered in Singapore (DBS, OCBC, UOB, HSBC, SCB).
 */
export const POPULAR_SORA_PACKAGES: BankPackage[] = [
  {
    id: 'dbs-3m',
    bankName: 'DBS Bank',
    packageName: '3M Compounded SORA Home Loan',
    benchmark: '3M_COMPOUNDED',
    marginYear1_3: 0.65,
    marginThereafter: 0.80,
    lockInYears: 2,
    legalSubsidySGD: 2000,
    cashRebateSGD: 1000,
    remarks: 'Most popular Singapore floating mortgage rate package, quarterly reset.',
  },
  {
    id: 'ocbc-1m',
    bankName: 'OCBC Bank',
    packageName: '1M Compounded SORA Home Loan',
    benchmark: '1M_COMPOUNDED',
    marginYear1_3: 0.70,
    marginThereafter: 0.85,
    lockInYears: 2,
    legalSubsidySGD: 1800,
    remarks: 'Monthly rate reset tracking immediate interest rate movements.',
  },
  {
    id: 'uob-3m',
    bankName: 'UOB Bank',
    packageName: '3M Compounded SORA Privilege Loan',
    benchmark: '3M_COMPOUNDED',
    marginYear1_3: 0.68,
    marginThereafter: 0.78,
    lockInYears: 2,
    legalSubsidySGD: 2200,
    remarks: 'Complimentary partial prepayments allowed during lock-in.',
  },
  {
    id: 'scb-3m',
    bankName: 'Standard Chartered',
    packageName: '3M SORA MortgageOne Offset',
    benchmark: '3M_COMPOUNDED',
    marginYear1_3: 0.75,
    marginThereafter: 0.85,
    lockInYears: 2,
    remarks: 'Includes interest-offset deposit account to reduce payable interest.',
  },
];

/**
 * Calculates the exact MAS Compounded SORA rate in arrears using historical daily rates.
 * Formula per MAS & ABS Standard:
 * Compounded Rate = [ product(1 + (r_i * n_i / 36500)) - 1 ] * (365 / d) * 100
 */
export function calculateCompoundedSoraInArrears(
  dailyRates: { sora: number; dayCount: number }[]
): number {
  if (!dailyRates || dailyRates.length === 0) return 2.90;

  let product = 1.0;
  let totalDays = 0;

  for (const item of dailyRates) {
    const r = item.sora;
    const n = item.dayCount;
    product *= 1 + (r * n) / 36500;
    totalDays += n;
  }

  if (totalDays === 0) return 2.90;

  const compounded = (product - 1) * (365 / totalDays) * 100;
  return Number(compounded.toFixed(4));
}

/**
 * Retrieves the benchmark rate based on selection or custom override.
 */
export function getBenchmarkRate(
  rates: MASRateRecord[],
  benchmark: SORACompoundingMethod,
  customOverride: number | null
): { rate: number; isCustom: boolean; sourceDate: string } {
  if (customOverride !== null && !isNaN(customOverride) && customOverride >= 0) {
    return {
      rate: customOverride,
      isCustom: true,
      sourceDate: 'User Defined Scenario',
    };
  }

  const latest = rates[0] || BUNDLED_MAS_RATES[0];

  switch (benchmark) {
    case '1M_COMPOUNDED':
      return {
        rate: latest.sora_1m ?? 2.87,
        isCustom: false,
        sourceDate: latest.date,
      };
    case '6M_COMPOUNDED':
      return {
        rate: latest.sora_6m ?? 3.01,
        isCustom: false,
        sourceDate: latest.date,
      };
    case 'DAILY_ARREARS': {
      // Calculate compounded SORA in arrears over recent 30 calendar days
      const subset = rates.slice(0, 22); // ~30 calendar days
      const arrearsRate = calculateCompoundedSoraInArrears(
        subset.map((r) => ({ sora: r.sora, dayCount: r.dayCount }))
      );
      return {
        rate: arrearsRate,
        isCustom: false,
        sourceDate: `${rates[subset.length - 1]?.date || 'Recent'} to ${latest.date}`,
      };
    }
    case '3M_COMPOUNDED':
    default:
      return {
        rate: latest.sora_3m ?? 2.95,
        isCustom: false,
        sourceDate: latest.date,
      };
  }
}

/**
 * Standard monthly mortgage payment calculation using annuity formula:
 * M = P * [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePct: number,
  tenureYears: number
): number {
  if (principal <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualRatePct / 100 / 12;

  if (r === 0) return principal / n;

  const factor = Math.pow(1 + r, n);
  const payment = (principal * r * factor) / (factor - 1);
  return Number(payment.toFixed(2));
}

/**
 * Comprehensive loan calculation including MAS TDSR/MSR checks.
 */
export function calculateLoanMetrics(
  params: LoanParameters,
  rates: MASRateRecord[]
): CalculationResult {
  const {
    loanAmount,
    tenureYears,
    propertyType,
    benchmark,
    bankMargin,
    customSoraOverride,
    stressRate,
    monthlyIncome,
    otherMonthlyDebts,
  } = params;

  const { rate: benchmarkRate } = getBenchmarkRate(
    rates,
    benchmark,
    customSoraOverride
  );

  const effectiveRate = Number((benchmarkRate + bankMargin).toFixed(4));
  const monthlyRepayment = calculateMonthlyPayment(
    loanAmount,
    effectiveRate,
    tenureYears
  );

  const totalRepayment = Number(
    (monthlyRepayment * tenureYears * 12).toFixed(2)
  );
  const totalInterest = Number(
    Math.max(0, totalRepayment - loanAmount).toFixed(2)
  );

  // First month breakdown
  const monthlyRate = effectiveRate / 100 / 12;
  const firstMonthInterest = Number((loanAmount * monthlyRate).toFixed(2));
  const firstMonthPrincipal = Number(
    Math.max(0, monthlyRepayment - firstMonthInterest).toFixed(2)
  );

  // Stressed calculation (MAS Medium-term floor is 4.00% for residential property)
  const effectiveStressRate = Math.max(stressRate, effectiveRate);
  const stressedRepayment = calculateMonthlyPayment(
    loanAmount,
    effectiveStressRate,
    tenureYears
  );
  const stressedDifference = Number(
    (stressedRepayment - monthlyRepayment).toFixed(2)
  );

  // TDSR and MSR calculations
  const totalMonthlyCommitmentStressed =
    stressedRepayment + (otherMonthlyDebts || 0);
  const tdsrRatio =
    monthlyIncome > 0
      ? Number(
          ((totalMonthlyCommitmentStressed / monthlyIncome) * 100).toFixed(1)
        )
      : 0;

  // MSR is only mandatory for HDB properties (Max 30%)
  const msrRatio =
    monthlyIncome > 0
      ? Number(((stressedRepayment / monthlyIncome) * 100).toFixed(1))
      : 0;

  const tdsrPassed = tdsrRatio <= 55;
  const msrPassed = propertyType === 'HDB' ? msrRatio <= 30 : true;

  return {
    effectiveRate,
    benchmarkRate,
    monthlyRepayment,
    totalRepayment,
    totalInterest,
    firstMonthPrincipal,
    firstMonthInterest,
    stressedRepayment,
    stressedDifference,
    tdsrRatio,
    msrRatio,
    tdsrPassed,
    msrPassed,
  };
}

/**
 * Generates the complete month-by-month amortization schedule.
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualRatePct: number,
  tenureYears: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const totalMonths = tenureYears * 12;
  const monthlyRate = annualRatePct / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    annualRatePct,
    tenureYears
  );

  let currentBalance = loanAmount;
  let cumulativeInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = currentBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    if (m === totalMonths || principalPayment > currentBalance) {
      principalPayment = currentBalance;
    }

    currentBalance = Math.max(0, currentBalance - principalPayment);
    cumulativeInterest += interestPayment;

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: Number((principalPayment + interestPayment).toFixed(2)),
      principal: Number(principalPayment.toFixed(2)),
      interest: Number(interestPayment.toFixed(2)),
      balance: Number(currentBalance.toFixed(2)),
      cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      rate: annualRatePct,
    });

    if (currentBalance <= 0) break;
  }

  return schedule;
}

/**
 * Aggregates monthly amortization schedule into annual breakdown.
 */
export function aggregateAnnualSchedule(
  monthlySchedule: AmortizationRow[]
): AnnualAmortizationRow[] {
  const annualMap = new Map<number, AnnualAmortizationRow>();

  for (const row of monthlySchedule) {
    const existing = annualMap.get(row.year);
    if (!existing) {
      annualMap.set(row.year, {
        year: row.year,
        annualPayment: row.payment,
        annualPrincipal: row.principal,
        annualInterest: row.interest,
        endingBalance: row.balance,
        cumulativeInterest: row.cumulativeInterest,
      });
    } else {
      existing.annualPayment = Number(
        (existing.annualPayment + row.payment).toFixed(2)
      );
      existing.annualPrincipal = Number(
        (existing.annualPrincipal + row.principal).toFixed(2)
      );
      existing.annualInterest = Number(
        (existing.annualInterest + row.interest).toFixed(2)
      );
      existing.endingBalance = row.balance;
      existing.cumulativeInterest = row.cumulativeInterest;
    }
  }

  return Array.from(annualMap.values());
}

/**
 * Attempts to fetch live MAS rates from public MAS API with robust fallback.
 */
export async function fetchLatestMASRates(): Promise<{
  rates: MASRateRecord[];
  isLive: boolean;
  fetchedAt: string;
}> {
  try {
    // Official MAS API endpoint for SORA and Interest Rates
    // Note: In sandboxed environments or browsers without direct CORS proxy,
    // this fetch is wrapped in a safe timeout and falls back to official bundled rates.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec7-0eb6491c6372&limit=40&sort=end_of_day%20desc',
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.result?.records && Array.isArray(data.result.records) && data.result.records.length > 0) {
        const parsed: MASRateRecord[] = data.result.records
          .filter((rec: any) => rec.end_of_day && rec.sora)
          .map((rec: any) => {
            const rawDate = rec.end_of_day;
            const dateObj = new Date(rawDate);
            const dayOfWeek = isNaN(dateObj.getDay()) ? 1 : dateObj.getDay();
            // Friday = 5 -> applies for 3 days (Fri, Sat, Sun)
            const dayCount = dayOfWeek === 5 ? 3 : 1;

            return {
              date: rawDate,
              sora: parseFloat(rec.sora) || 2.90,
              sora_1m: rec.sora_compounded_1m ? parseFloat(rec.sora_compounded_1m) : undefined,
              sora_3m: rec.sora_compounded_3m ? parseFloat(rec.sora_compounded_3m) : undefined,
              sora_6m: rec.sora_compounded_6m ? parseFloat(rec.sora_compounded_6m) : undefined,
              sora_index: rec.sora_index ? parseFloat(rec.sora_index) : undefined,
              volumeMillionSGD: rec.aggregate_volume ? parseFloat(rec.aggregate_volume) : 4000,
              dayCount,
            };
          });

        if (parsed.length > 0) {
          return {
            rates: parsed,
            isLive: true,
            fetchedAt: new Date().toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }
      }
    }
  } catch (_err) {
    // Graceful fallback to verified bundled MAS benchmark cache
  }

  return {
    rates: BUNDLED_MAS_RATES,
    isLive: false,
    fetchedAt: 'Bundled MAS Official Series',
  };
}

/**
 * Exports amortization schedule to CSV file.
 */
export function exportAmortizationCSV(
  schedule: AmortizationRow[],
  loanAmount: number,
  rate: number,
  tenure: number
): void {
  const headers = [
    'Month',
    'Year',
    'Monthly Installment (SGD)',
    'Principal Paid (SGD)',
    'Interest Paid (SGD)',
    'Remaining Balance (SGD)',
    'Cumulative Interest (SGD)',
    'Effective Rate (% p.a.)',
  ];

  const rows = schedule.map((r) => [
    r.month,
    r.year,
    r.payment.toFixed(2),
    r.principal.toFixed(2),
    r.interest.toFixed(2),
    r.balance.toFixed(2),
    r.cumulativeInterest.toFixed(2),
    r.rate.toFixed(3),
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      `# SORA Loan Amortization Schedule - Loan: SGD ${loanAmount.toLocaleString()} | Rate: ${rate.toFixed(3)}% | Tenure: ${tenure} Years`,
      headers.join(','),
      ...rows.map((e) => e.join(',')),
    ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SORA_Amortization_SGD_${loanAmount}_${tenure}Y.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
