/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SORACompoundingMethod =
  | '1M_COMPOUNDED'
  | '3M_COMPOUNDED'
  | '6M_COMPOUNDED'
  | 'DAILY_ARREARS';

export type PropertyType = 'HDB' | 'CONDO' | 'LANDED' | 'COMMERCIAL';

export interface MASRateRecord {
  date: string; // YYYY-MM-DD
  sora: number; // Daily overnight rate in %
  sora_1m?: number; // 1-month compounded rate in %
  sora_3m?: number; // 3-month compounded rate in %
  sora_6m?: number; // 6-month compounded rate in %
  sora_index?: number;
  volumeMillionSGD: number; // Volume in SGD millions
  dayCount: number; // Day weight n_i (e.g., 3 over weekends)
}

export interface LoanParameters {
  loanAmount: number;
  tenureYears: number;
  propertyType: PropertyType;
  benchmark: SORACompoundingMethod;
  bankMargin: number; // in %
  customSoraOverride: number | null; // in % or null for MAS rate
  stressRate: number; // in %, default 4.00% (MAS floor)
  monthlyIncome: number; // SGD
  otherMonthlyDebts: number; // SGD
}

export interface CalculationResult {
  effectiveRate: number;
  benchmarkRate: number;
  monthlyRepayment: number;
  totalRepayment: number;
  totalInterest: number;
  firstMonthPrincipal: number;
  firstMonthInterest: number;
  stressedRepayment: number;
  stressedDifference: number;
  tdsrRatio: number;
  msrRatio: number;
  tdsrPassed: boolean;
  msrPassed: boolean;
}

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  rate: number;
}

export interface AnnualAmortizationRow {
  year: number;
  annualPayment: number;
  annualPrincipal: number;
  annualInterest: number;
  endingBalance: number;
  cumulativeInterest: number;
}

export interface BankPackage {
  id: string;
  bankName: string;
  packageName: string;
  benchmark: SORACompoundingMethod;
  marginYear1_3: number;
  marginThereafter: number;
  lockInYears: number;
  legalSubsidySGD?: number;
  cashRebateSGD?: number;
  remarks?: string;
}
