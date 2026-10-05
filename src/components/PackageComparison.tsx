/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { BankPackage, SORACompoundingMethod } from '../types/sora';
import { POPULAR_SORA_PACKAGES, calculateMonthlyPayment } from '../services/masSoraService';

interface PackageComparisonProps {
  loanAmount: number;
  tenureYears: number;
  sora1mRate: number;
  sora3mRate: number;
  onApplyPackage: (benchmark: SORACompoundingMethod, margin: number) => void;
}

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  loanAmount,
  tenureYears,
  sora1mRate,
  sora3mRate,
  onApplyPackage,
}) => {
  const [packages, setPackages] = useState<BankPackage[]>(POPULAR_SORA_PACKAGES);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customBankName, setCustomBankName] = useState('');
  const [customPackageName, setCustomPackageName] = useState('');
  const [customBenchmark, setCustomBenchmark] = useState<SORACompoundingMethod>('3M_COMPOUNDED');
  const [customMarginY1, setCustomMarginY1] = useState(0.65);
  const [customMarginThereafter, setCustomMarginThereafter] = useState(0.80);

  const getBenchmarkValue = (benchmark: SORACompoundingMethod) => {
    switch (benchmark) {
      case '1M_COMPOUNDED':
        return sora1mRate;
      case '6M_COMPOUNDED':
        return 3.01;
      case 'DAILY_ARREARS':
        return 2.89;
      case '3M_COMPOUNDED':
      default:
        return sora3mRate;
    }
  };

  const handleAddPackage = () => {
    if (!customBankName || !customPackageName) return;
    const newPkg: BankPackage = {
      id: `pkg-${Date.now()}`,
      bankName: customBankName,
      packageName: customPackageName,
      benchmark: customBenchmark,
      marginYear1_3: customMarginY1,
      marginThereafter: customMarginThereafter,
      lockInYears: 2,
    };
    setPackages([...packages, newPkg]);
    setCustomBankName('');
    setCustomPackageName('');
    setShowAddCustom(false);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Singapore Bank SORA Loan Packages Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compare indicative mortgage spreads, lock-in periods, and projected cash outlays for a loan of ${loanAmount.toLocaleString()} over {tenureYears} years
            </p>
          </div>

          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Custom Package</span>
          </button>
        </div>

        {/* Add custom package form */}
        {showAddCustom && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <h4 className="text-xs font-semibold text-slate-800 mb-3">Add Custom Loan Package</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maybank, HSBC"
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. 3M SORA Promo"
                  value={customPackageName}
                  onChange={(e) => setCustomPackageName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Benchmark</label>
                <select
                  value={customBenchmark}
                  onChange={(e) => setCustomBenchmark(e.target.value as SORACompoundingMethod)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-400"
                >
                  <option value="3M_COMPOUNDED">3M Compounded SORA</option>
                  <option value="1M_COMPOUNDED">1M Compounded SORA</option>
                  <option value="6M_COMPOUNDED">6M Compounded SORA</option>
                  <option value="DAILY_ARREARS">Daily SORA Arrears</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Y1-3 Margin (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customMarginY1}
                  onChange={(e) => setCustomMarginY1(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddPackage}
                  className="w-full py-1.5 px-3 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Save Package
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {packages.map((pkg) => {
            const benchVal = getBenchmarkValue(pkg.benchmark);
            const rateY1 = benchVal + pkg.marginYear1_3;
            const rateThereafter = benchVal + pkg.marginThereafter;

            const paymentY1 = calculateMonthlyPayment(loanAmount, rateY1, tenureYears);
            const paymentThereafter = calculateMonthlyPayment(loanAmount, rateThereafter, tenureYears);
            const threeYearOutlay = paymentY1 * 36;

            const benchmarkLabel =
              pkg.benchmark === '1M_COMPOUNDED'
                ? '1M SORA'
                : pkg.benchmark === '6M_COMPOUNDED'
                ? '6M SORA'
                : pkg.benchmark === 'DAILY_ARREARS'
                ? 'Daily SORA'
                : '3M SORA';

            return (
              <div
                key={pkg.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-colors relative group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">{pkg.bankName}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{pkg.packageName}</h3>
                    </div>
                    {pkg.id.startsWith('pkg-') && (
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Benchmark pill-free display */}
                  <div className="text-xs text-slate-600 mt-3 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <span>Benchmark:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {benchmarkLabel} ({benchVal.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Rates Breakdown */}
                  <div className="space-y-2.5 py-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Year 1 - 3 Margin:</span>
                      <span className="font-mono text-slate-800 font-medium">
                        +{pkg.marginYear1_3.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Initial Effective Rate:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {rateY1.toFixed(2)}% p.a.
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Thereafter Rate:</span>
                      <span className="font-mono text-slate-700">
                        {rateThereafter.toFixed(2)}% p.a.
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lock-in Period:</span>
                      <span className="text-slate-800 font-medium">{pkg.lockInYears} Years</span>
                    </div>
                  </div>

                  {/* Monthly Payment Output */}
                  <div className="py-3 text-xs space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">Initial Installment:</span>
                      <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
                        ${paymentY1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-slate-500">
                      <span>Thereafter:</span>
                      <span className="font-mono tabular-nums">
                        ${paymentThereafter.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-slate-500">
                      <span>3-Year Outlay:</span>
                      <span className="font-mono tabular-nums font-medium text-slate-700">
                        ${threeYearOutlay.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Incentives */}
                  {(pkg.legalSubsidySGD || pkg.cashRebateSGD) && (
                    <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded text-[11px] text-emerald-800 space-y-0.5 mb-3">
                      {pkg.legalSubsidySGD && (
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>S${pkg.legalSubsidySGD.toLocaleString()} Legal Fee Subsidy</span>
                        </div>
                      )}
                      {pkg.cashRebateSGD && (
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>S${pkg.cashRebateSGD.toLocaleString()} Cash Rebate</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onApplyPackage(pkg.benchmark, pkg.marginYear1_3)}
                  className="w-full mt-3 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Apply to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
