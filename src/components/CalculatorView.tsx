/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Percent,
  TrendingDown,
  Building2,
  DollarSign,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CalculationResult,
  LoanParameters,
  MASRateRecord,
  PropertyType,
  SORACompoundingMethod,
} from '../types/sora';
import { AmortizationSchedule } from './AmortizationSchedule';
import {
  aggregateAnnualSchedule,
  exportAmortizationCSV,
  generateAmortizationSchedule,
} from '../services/masSoraService';

interface CalculatorViewProps {
  params: LoanParameters;
  results: CalculationResult;
  masRates: MASRateRecord[];
  isLiveRates: boolean;
  onUpdateParams: (newParams: Partial<LoanParameters>) => void;
  onExportCSV: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  params,
  results,
  masRates,
  isLiveRates,
  onUpdateParams,
  onExportCSV,
}) => {
  const [showTdsrSection, setShowTdsrSection] = useState(false);
  const [showAmortization, setShowAmortization] = useState(true);
  const [isCustomOverrideActive, setIsCustomOverrideActive] = useState(
    params.customSoraOverride !== null
  );

  const latestRate = masRates[0];

  // Property presets
  const applyPropertyPreset = (type: PropertyType, amount: number, tenure: number) => {
    onUpdateParams({
      propertyType: type,
      loanAmount: amount,
      tenureYears: tenure,
    });
  };

  // Generate schedules for amortization component
  const monthlySchedule = generateAmortizationSchedule(
    params.loanAmount,
    results.effectiveRate,
    params.tenureYears
  );
  const annualSchedule = aggregateAnnualSchedule(monthlySchedule);

  // First month payment composition percentages
  const principalPercent = results.monthlyRepayment > 0
    ? (results.firstMonthPrincipal / results.monthlyRepayment) * 100
    : 50;
  const interestPercent = 100 - principalPercent;

  return (
    <div className="space-y-6">
      {/* Property Preset Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Singapore Property Loan Presets:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => applyPropertyPreset('HDB', 450000, 25)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                params.loanAmount === 450000 && params.propertyType === 'HDB'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              HDB 4-Room ($450k)
            </button>
            <button
              onClick={() => applyPropertyPreset('HDB', 650000, 25)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                params.loanAmount === 650000 && params.propertyType === 'HDB'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              HDB Resale ($650k)
            </button>
            <button
              onClick={() => applyPropertyPreset('CONDO', 1200000, 30)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                params.loanAmount === 1200000 && params.propertyType === 'CONDO'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Private Condo ($1.2M)
            </button>
            <button
              onClick={() => applyPropertyPreset('LANDED', 2800000, 30)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                params.loanAmount === 2800000 && params.propertyType === 'LANDED'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Landed Home ($2.8M)
            </button>
          </div>
        </div>

        {/* Property Type radio */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-600">
          <span className="font-medium text-slate-800">Property Category:</span>
          {(['HDB', 'CONDO', 'LANDED', 'COMMERCIAL'] as PropertyType[]).map((type) => (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                checked={params.propertyType === type}
                onChange={() => onUpdateParams({ propertyType: type })}
                className="accent-slate-900"
              />
              <span className={params.propertyType === type ? 'font-semibold text-slate-900' : ''}>
                {type === 'HDB'
                  ? 'HDB Flat (MSR applies)'
                  : type === 'CONDO'
                  ? 'Private Condo / EC'
                  : type === 'LANDED'
                  ? 'Landed Residential'
                  : 'Commercial Property'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Loan Input Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span>Loan Parameters</span>
              </h3>
              <span className="text-xs text-slate-500">
                ACT/365 Singapore Standard
              </span>
            </div>

            {/* Loan Principal Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="loan-principal-input" className="text-xs font-semibold text-slate-700">
                  Loan Principal (SGD)
                </label>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <button
                    onClick={() => onUpdateParams({ loanAmount: Math.max(50000, params.loanAmount - 50000) })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    -$50k
                  </button>
                  <button
                    onClick={() => onUpdateParams({ loanAmount: params.loanAmount + 50000 })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    +$50k
                  </button>
                  <button
                    onClick={() => onUpdateParams({ loanAmount: params.loanAmount + 100000 })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    +$100k
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                  S$
                </span>
                <input
                  id="loan-principal-input"
                  type="number"
                  step="10000"
                  min="50000"
                  max="10000000"
                  value={params.loanAmount}
                  onChange={(e) =>
                    onUpdateParams({ loanAmount: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <input
                type="range"
                min="100000"
                max="3000000"
                step="25000"
                value={params.loanAmount}
                onChange={(e) => onUpdateParams({ loanAmount: parseInt(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer mt-2.5 h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>$100k</span>
                <span>$1M</span>
                <span>$2M</span>
                <span>$3M+</span>
              </div>
            </div>

            {/* Loan Tenure Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="loan-tenure-input" className="text-xs font-semibold text-slate-700">
                  Loan Tenure (Years)
                </label>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  {params.tenureYears} Years ({params.tenureYears * 12} Months)
                </span>
              </div>

              <div className="relative">
                <input
                  id="loan-tenure-input"
                  type="number"
                  min="5"
                  max={params.propertyType === 'HDB' ? 30 : 35}
                  value={params.tenureYears}
                  onChange={(e) =>
                    onUpdateParams({
                      tenureYears: Math.min(
                        params.propertyType === 'HDB' ? 30 : 35,
                        Math.max(5, parseInt(e.target.value) || 5)
                      ),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <input
                type="range"
                min="5"
                max={params.propertyType === 'HDB' ? 30 : 35}
                step="1"
                value={params.tenureYears}
                onChange={(e) => onUpdateParams({ tenureYears: parseInt(e.target.value) })}
                className="w-full accent-slate-900 cursor-pointer mt-2.5 h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>5 Yrs</span>
                <span>15 Yrs</span>
                <span>25 Yrs</span>
                <span>{params.propertyType === 'HDB' ? '30 Yrs (Max HDB)' : '35 Yrs (Max Bank)'}</span>
              </div>
            </div>

            {/* Benchmark Selection */}
            <div>
              <label htmlFor="benchmark-select" className="text-xs font-semibold text-slate-700 block mb-1.5">
                SORA Benchmark Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '3M_COMPOUNDED', label: '3M SORA', desc: 'Standard (Quarterly)' },
                  { id: '1M_COMPOUNDED', label: '1M SORA', desc: 'Monthly Reset' },
                  { id: '6M_COMPOUNDED', label: '6M SORA', desc: 'Semi-Annual Reset' },
                  { id: 'DAILY_ARREARS', label: 'Daily Arrears', desc: 'Exact Compounding' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onUpdateParams({
                        benchmark: item.id as SORACompoundingMethod,
                      })
                    }
                    className={`p-2.5 text-left border rounded-md transition-colors ${
                      params.benchmark === item.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        params.benchmark === item.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SORA Rate Source & Custom Override Option */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">Benchmark Rate:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {results.benchmarkRate.toFixed(2)}% p.a.
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Source:</span>
                <span>
                  {isCustomOverrideActive
                    ? 'User Custom Scenario'
                    : `${latestRate?.date ?? 'MAS'} ${isLiveRates ? '(Live MAS API)' : '(MAS Benchmark)'}`}
                </span>
              </div>

              {/* Custom Override Checkbox */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomOverrideActive}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsCustomOverrideActive(checked);
                      onUpdateParams({
                        customSoraOverride: checked ? 2.95 : null,
                      });
                    }}
                    className="accent-slate-900"
                  />
                  <span>Manual SORA Rate Override</span>
                </label>

                {isCustomOverrideActive && (
                  <div className="flex items-center gap-1 w-24">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="15"
                      value={params.customSoraOverride ?? 2.95}
                      onChange={(e) =>
                        onUpdateParams({
                          customSoraOverride: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Margin / Spread */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="bank-margin-input" className="text-xs font-semibold text-slate-700">
                  Bank Margin / Spread (% p.a.)
                </label>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  +{params.bankMargin.toFixed(2)}%
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                  +
                </span>
                <input
                  id="bank-margin-input"
                  type="number"
                  step="0.05"
                  min="0"
                  max="5"
                  value={params.bankMargin}
                  onChange={(e) =>
                    onUpdateParams({ bankMargin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-7 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                  %
                </span>
              </div>

              <div className="flex gap-1.5 mt-2">
                {[0.60, 0.65, 0.70, 0.75, 0.85].map((m) => (
                  <button
                    key={m}
                    onClick={() => onUpdateParams({ bankMargin: m })}
                    className={`flex-1 py-1 text-[11px] font-mono rounded border transition-colors ${
                      params.bankMargin === m
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    +{m.toFixed(2)}%
                  </button>
                ))}
              </div>
            </div>

            {/* TDSR Affordability Checker Accordion Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowTdsrSection(!showTdsrSection)}
                className="w-full flex items-center justify-between text-xs font-medium text-slate-700 hover:text-slate-900 py-1"
              >
                <span>MAS TDSR & MSR Affordability Check</span>
                {showTdsrSection ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showTdsrSection && (
                <div className="space-y-3 pt-3">
                  <div>
                    <label htmlFor="gross-monthly-income-input" className="text-[11px] text-slate-600 block mb-1">
                      Gross Monthly Income (SGD)
                    </label>
                    <input
                      id="gross-monthly-income-input"
                      type="number"
                      step="500"
                      min="1000"
                      value={params.monthlyIncome}
                      onChange={(e) =>
                        onUpdateParams({ monthlyIncome: parseInt(e.target.value) || 0 })
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="other-monthly-debts-input" className="text-[11px] text-slate-600 block mb-1">
                      Other Monthly Debt Commitments (Car, Loans)
                    </label>
                    <input
                      id="other-monthly-debts-input"
                      type="number"
                      step="100"
                      min="0"
                      value={params.otherMonthlyDebts}
                      onChange={(e) =>
                        onUpdateParams({ otherMonthlyDebts: parseInt(e.target.value) || 0 })
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="mas-stress-interest-rate-input" className="text-[11px] text-slate-600 block mb-1">
                      MAS Regulatory Stress Floor (% p.a.)
                    </label>
                    <input
                      id="mas-stress-interest-rate-input"
                      type="number"
                      step="0.1"
                      min="3.0"
                      max="7.0"
                      value={params.stressRate}
                      onChange={(e) =>
                        onUpdateParams({ stressRate: parseFloat(e.target.value) || 4.0 })
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      MAS medium-term interest rate floor is 4.00% p.a.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Financial Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Primary Hero Card */}
          <div className="bg-slate-900 text-white rounded-lg p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Monthly Loan Installment
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-white">
                      ${results.monthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-slate-400 block">Effective Borrowing Rate</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                      {results.effectiveRate.toFixed(2)}%
                    </span>
                    <span className="text-xs text-slate-400">p.a.</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {results.benchmarkRate.toFixed(2)}% (SORA) + {params.bankMargin.toFixed(2)}% (Margin)
                  </span>
                </div>
              </div>

              {/* 3 Secondary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Total Interest Payable</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-white mt-0.5 block">
                    ${results.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    over {params.tenureYears} years ({params.tenureYears * 12} installments)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Total Loan Repaid</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-white mt-0.5 block">
                    ${results.totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Principal + Cumulative Interest
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">First Month Interest</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-200 mt-0.5 block">
                    ${results.firstMonthInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Principal: ${results.firstMonthPrincipal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* First Month Repayment Composition */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Initial Payment Composition (Month 1)
            </h4>
            <div className="flex h-3 rounded overflow-hidden bg-slate-100">
              <div
                style={{ width: `${principalPercent}%` }}
                className="bg-emerald-600 transition-all duration-300"
                title={`Principal: ${principalPercent.toFixed(1)}%`}
              />
              <div
                style={{ width: `${interestPercent}%` }}
                className="bg-slate-700 transition-all duration-300"
                title={`Interest: ${interestPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span>
                <span>
                  Principal: ${results.firstMonthPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })} (
                  {principalPercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block"></span>
                <span>
                  Interest: ${results.firstMonthInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })} (
                  {interestPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* MAS Regulatory TDSR / Stress Test Status Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  MAS Regulatory Stress Test Assessment (at {params.stressRate.toFixed(2)}% Floor)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {results.tdsrPassed ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    TDSR Compliant ({results.tdsrRatio}%)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Exceeds TDSR ({results.tdsrRatio}%)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block">Stressed Monthly Installment</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5 block">
                  ${results.stressedRepayment.toLocaleString(undefined, { minimumFractionDigits: 2 })} / mo
                </span>
                <span className="text-[11px] text-amber-700 font-mono mt-0.5 block">
                  +${results.stressedDifference.toFixed(2)}/mo buffer required
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">TDSR Ceiling:</span>
                  <span className="font-mono text-slate-900 font-medium">55.0% Limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Calculated TDSR:</span>
                  <span
                    className={`font-mono font-bold ${
                      results.tdsrPassed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {results.tdsrRatio}%
                  </span>
                </div>
                {params.propertyType === 'HDB' && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">HDB MSR (Max 30%):</span>
                    <span
                      className={`font-mono font-bold ${
                        results.msrPassed ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {results.msrRatio}% ({results.msrPassed ? 'Pass' : 'Fail'})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Section */}
      <div className="pt-2">
        <AmortizationSchedule
          monthlySchedule={monthlySchedule}
          annualSchedule={annualSchedule}
          onExportCSV={onExportCSV}
        />
      </div>
    </div>
  );
};
