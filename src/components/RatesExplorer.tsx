/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Calculator, HelpCircle, CheckCircle2 } from 'lucide-react';
import { MASRateRecord } from '../types/sora';
import { calculateCompoundedSoraInArrears } from '../services/masSoraService';

interface RatesExplorerProps {
  rates: MASRateRecord[];
  isLive: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const RatesExplorer: React.FC<RatesExplorerProps> = ({
  rates,
  isLive,
  lastUpdated,
  onRefresh,
  isLoading,
}) => {
  const [arrearsWindowDays, setArrearsWindowDays] = useState<number>(30);
  const latestRate = rates[0];

  // Calculate dynamic arrears rate for selected observation window
  const selectedRecords = rates.slice(
    0,
    Math.min(rates.length, Math.ceil((arrearsWindowDays * 5) / 7))
  );

  const dynamicArrears = calculateCompoundedSoraInArrears(
    selectedRecords.map((r) => ({ sora: r.sora, dayCount: r.dayCount }))
  );

  const totalCalendarDaysInWindow = selectedRecords.reduce(
    (acc, cur) => acc + cur.dayCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top benchmark banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Monetary Authority of Singapore (MAS) Benchmark Rates
              </h2>
              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isLive ? 'Live MAS API' : 'Official MAS Series'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Volume-weighted average rate of unsecured overnight SGD interbank transactions
              brokered in Singapore · Last updated: {lastUpdated}
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync MAS Rates</span>
          </button>
        </div>

        {/* 4 Primary Benchmark Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-md">
            <span className="text-xs text-slate-500 block">Daily Overnight SORA</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {latestRate?.sora.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400">p.a.</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              As of {latestRate?.date}
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-md">
            <span className="text-xs text-slate-500 block">1-Month Compounded SORA</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {latestRate?.sora_1m?.toFixed(2) ?? '2.87'}%
              </span>
              <span className="text-xs text-slate-400">p.a.</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Monthly mortgage reset
            </span>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 block">3-Month Compounded SORA</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
                Standard
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {latestRate?.sora_3m?.toFixed(2) ?? '2.95'}%
              </span>
              <span className="text-xs text-slate-300">p.a.</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              DBS / OCBC / UOB primary
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-md">
            <span className="text-xs text-slate-500 block">6-Month Compounded SORA</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {latestRate?.sora_6m?.toFixed(2) ?? '3.01'}%
              </span>
              <span className="text-xs text-slate-400">p.a.</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Semi-annual loan reset
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Arrears Formula Sandbox */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Daily Compounded SORA in Arrears Simulation
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Computes compounded rate from daily overnight rates over selected observation window
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setArrearsWindowDays(14)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                arrearsWindowDays === 14
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setArrearsWindowDays(30)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                arrearsWindowDays === 30
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days (~1M)
            </button>
            <button
              onClick={() => setArrearsWindowDays(90)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                arrearsWindowDays === 90
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90 Days (~3M)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-slate-50 rounded-md border border-slate-100 flex flex-col justify-between">
            <span className="text-xs text-slate-500">Calculated Compounded Rate</span>
            <div className="my-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                {dynamicArrears.toFixed(4)}%
              </span>
              <span className="text-xs text-slate-500 ml-1">p.a.</span>
            </div>
            <span className="text-xs text-slate-500">
              Computed across {totalCalendarDaysInWindow} calendar days ({selectedRecords.length} trading days)
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-md border border-slate-100 md:col-span-2">
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              MAS Standard Compounding Formula (ACT/365)
            </span>
            <div className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-800 overflow-x-auto">
              Compounded Rate = [ ∏ ( 1 + (r_i × n_i) / 36,500 ) - 1 ] × (365 / d) × 100
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
              <div>
                <span className="font-mono text-slate-900 font-semibold">r_i</span> = SORA rate on business day i
              </div>
              <div>
                <span className="font-mono text-slate-900 font-semibold">n_i</span> = Calendar days rate applies (Fri = 3)
              </div>
              <div>
                <span className="font-mono text-slate-900 font-semibold">d</span> = Total calendar days in window
              </div>
              <div>
                <span className="font-mono text-slate-900 font-semibold">365</span> = Singapore ACT/365 money market base
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Daily Rates Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Daily SORA & Compounded Historical Observations
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual transaction day records showing overnight rates, compounding indices, and aggregate market volume
          </p>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2 px-3 font-medium">Observation Date</th>
                <th className="py-2 px-3 font-medium text-right">Daily Overnight SORA</th>
                <th className="py-2 px-3 font-medium text-right">Day Weight (n_i)</th>
                <th className="py-2 px-3 font-medium text-right">1M Compounded</th>
                <th className="py-2 px-3 font-medium text-right">3M Compounded</th>
                <th className="py-2 px-3 font-medium text-right">6M Compounded</th>
                <th className="py-2 px-3 font-medium text-right">Volume (SGD M)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-medium text-slate-900 font-mono">
                    {row.date}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-900 font-mono tabular-nums">
                    {row.sora.toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                    {row.dayCount} {row.dayCount > 1 ? 'days' : 'day'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 font-mono tabular-nums">
                    {row.sora_1m !== undefined ? `${row.sora_1m.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800 font-semibold font-mono tabular-nums">
                    {row.sora_3m !== undefined ? `${row.sora_3m.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 font-mono tabular-nums">
                    {row.sora_6m !== undefined ? `${row.sora_6m.toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500 font-mono tabular-nums">
                    S${row.volumeMillionSGD.toLocaleString()}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-900">
            Singapore SORA Reference Guide
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div>
            <span className="font-semibold text-slate-800 block mb-1">
              What is SORA?
            </span>
            SORA replaced SIBOR and SOR as Singapore&apos;s robust interest rate benchmark.
            Because it is calculated from actual completed overnight transactions, it has zero
            expert judgment or credit risk premium.
          </div>
          <div>
            <span className="font-semibold text-slate-800 block mb-1">
              Why 3M Compounded SORA?
            </span>
            Compounding overnight rates over 3 months filters out single-day volatility, giving
            borrowers predictable quarterly mortgage installments. Most banks in Singapore
            use 3M SORA as their primary package benchmark.
          </div>
          <div>
            <span className="font-semibold text-slate-800 block mb-1">
              MAS TDSR Stress Floor (4.00%)
            </span>
            Under MAS regulations, all financial institutions must assess home loan affordability
            using a medium-term stress interest rate floor of at least 4.00% p.a., ensuring
            homeowners can withstand potential interest rate surges.
          </div>
        </div>
      </div>
    </div>
  );
};
