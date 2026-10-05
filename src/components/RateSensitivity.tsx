/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { calculateMonthlyPayment } from '../services/masSoraService';

interface RateSensitivityProps {
  loanAmount: number;
  tenureYears: number;
  bankMargin: number;
  currentBenchmarkRate: number;
}

export const RateSensitivity: React.FC<RateSensitivityProps> = ({
  loanAmount,
  tenureYears,
  bankMargin,
  currentBenchmarkRate,
}) => {
  const [customTestRate, setCustomTestRate] = useState<number>(3.5);

  const currentEffectiveRate = currentBenchmarkRate + bankMargin;
  const currentMonthlyPayment = calculateMonthlyPayment(
    loanAmount,
    currentEffectiveRate,
    tenureYears
  );

  const scenarioRates = [1.5, 2.0, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.5, 5.0, 5.5];

  const sensitivityRows = useMemo(() => {
    return scenarioRates.map((sora) => {
      const effective = sora + bankMargin;
      const payment = calculateMonthlyPayment(loanAmount, effective, tenureYears);
      const totalCost = payment * tenureYears * 12;
      const totalInterest = Math.max(0, totalCost - loanAmount);
      const monthlyDelta = payment - currentMonthlyPayment;

      return {
        sora,
        effective,
        payment,
        monthlyDelta,
        totalInterest,
        isNearCurrent: Math.abs(sora - currentBenchmarkRate) < 0.15,
        isMasFloor: Math.abs(effective - 4.0) < 0.1,
      };
    });
  }, [scenarioRates, bankMargin, loanAmount, tenureYears, currentMonthlyPayment, currentBenchmarkRate]);

  // Custom slider calculation
  const customEffective = customTestRate + bankMargin;
  const customPayment = calculateMonthlyPayment(loanAmount, customEffective, tenureYears);
  const customDelta = customPayment - currentMonthlyPayment;
  const customTotalInterest = Math.max(0, customPayment * tenureYears * 12 - loanAmount);

  return (
    <div className="space-y-6">
      {/* Intro banner & custom slider */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              SORA Rate Sensitivity & Scenario Stress Test
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze how monthly mortgage obligations and total borrowing costs change across
              different SORA interest cycles
            </p>
          </div>

          <div className="text-right self-stretch sm:self-auto bg-slate-50 p-3 rounded-md border border-slate-100">
            <span className="text-xs text-slate-500 block">Current Baseline Payment</span>
            <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
              ${currentMonthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 block">
              at {currentEffectiveRate.toFixed(2)}% ({currentBenchmarkRate.toFixed(2)}% + {bankMargin.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Dynamic Scenario Slider */}
        <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label htmlFor="interactive-sora-test-rate" className="text-xs font-semibold text-slate-700">
              Interactive Test Rate: SORA at{' '}
              <span className="font-mono text-slate-900 text-sm">
                {customTestRate.toFixed(2)}%
              </span>{' '}
              (Effective: {customEffective.toFixed(2)}%)
            </label>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">
                Monthly Repayment:{' '}
                <strong className="text-slate-900 font-mono tabular-nums">
                  ${customPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span
                className={`font-mono font-medium ${
                  customDelta > 0
                    ? 'text-amber-700'
                    : customDelta < 0
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                {customDelta > 0 ? `+$${customDelta.toFixed(0)}/mo` : customDelta < 0 ? `-$${Math.abs(customDelta).toFixed(0)}/mo` : '0/mo'}
              </span>
            </div>
          </div>

          <input
            id="interactive-sora-test-rate"
            type="range"
            min="1.0"
            max="6.0"
            step="0.05"
            value={customTestRate}
            onChange={(e) => setCustomTestRate(parseFloat(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>1.0% (Historic Low)</span>
            <span>2.95% (Current 3M SORA)</span>
            <span>4.0% (MAS Stress Floor)</span>
            <span>6.0% (High Stress)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Monthly Difference</span>
              <span className="font-mono font-semibold text-slate-900 text-sm">
                {customDelta >= 0 ? '+' : ''}${customDelta.toFixed(2)} / month
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Annual Cash Outlay</span>
              <span className="font-mono font-semibold text-slate-900 text-sm">
                ${(customPayment * 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Interest over {tenureYears} Yrs</span>
              <span className="font-mono font-semibold text-slate-900 text-sm">
                ${customTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Rate Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              SORA Rate Sensitivity Matrix (Loan: ${loanAmount.toLocaleString()} · {tenureYears} Years)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes current bank margin of +{bankMargin.toFixed(2)}% p.a.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 bg-slate-100 border border-slate-300 rounded"></span>
            <span>Current Benchmark</span>
            <span className="inline-block w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded ml-2"></span>
            <span>MAS Stress Floor</span>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2.5 px-3 font-medium">SORA Rate</th>
                <th className="py-2.5 px-3 font-medium">Bank Margin</th>
                <th className="py-2.5 px-3 font-medium">Effective Total Rate</th>
                <th className="py-2.5 px-3 font-medium text-right">Monthly Payment</th>
                <th className="py-2.5 px-3 font-medium text-right">Monthly Difference</th>
                <th className="py-2.5 px-3 font-medium text-right">Total Interest Paid</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sensitivityRows.map((row) => (
                <tr
                  key={row.sora}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.isNearCurrent
                      ? 'bg-slate-100/70 font-medium'
                      : row.isMasFloor
                      ? 'bg-amber-50/60'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 tabular-nums">
                    {row.sora.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums">
                    +{bankMargin.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 tabular-nums">
                    {row.effective.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono tabular-nums ${
                      row.monthlyDelta > 0
                        ? 'text-amber-700'
                        : row.monthlyDelta < 0
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {row.monthlyDelta > 0 ? `+$${row.monthlyDelta.toFixed(2)}` : row.monthlyDelta < 0 ? `-$${Math.abs(row.monthlyDelta).toFixed(2)}` : 'Baseline'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                    ${row.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center text-xs">
                    {row.isNearCurrent ? (
                      <span className="text-slate-800 font-semibold">Current</span>
                    ) : row.isMasFloor ? (
                      <span className="text-amber-700 font-medium">MAS 4.0% Floor</span>
                    ) : row.sora > 4.0 ? (
                      <span className="text-slate-400">High Rate</span>
                    ) : (
                      <span className="text-slate-400">Low Rate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
