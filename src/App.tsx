/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CalculatorView } from './components/CalculatorView';
import { RatesExplorer } from './components/RatesExplorer';
import { RateSensitivity } from './components/RateSensitivity';
import { PackageComparison } from './components/PackageComparison';
import {
  LoanParameters,
  MASRateRecord,
  SORACompoundingMethod,
} from './types/sora';
import {
  BUNDLED_MAS_RATES,
  calculateLoanMetrics,
  exportAmortizationCSV,
  fetchLatestMASRates,
  generateAmortizationSchedule,
  getBenchmarkRate,
} from './services/masSoraService';

const DEFAULT_PARAMS: LoanParameters = {
  loanAmount: 650000, // Typical Singapore HDB Resale / starter condo loan
  tenureYears: 25,
  propertyType: 'HDB',
  benchmark: '3M_COMPOUNDED',
  bankMargin: 0.65, // Standard floating bank spread
  customSoraOverride: null,
  stressRate: 4.0, // MAS regulatory floor
  monthlyIncome: 9500,
  otherMonthlyDebts: 600,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'rates' | 'sensitivity' | 'packages'
  >('calculator');
  const [params, setParams] = useState<LoanParameters>(DEFAULT_PARAMS);
  const [masRates, setMasRates] = useState<MASRateRecord[]>(BUNDLED_MAS_RATES);
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Bundled MAS Series');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);

  // Load latest MAS rates on initial mount
  useEffect(() => {
    let mounted = true;
    const loadRates = async () => {
      setIsLoadingRates(true);
      const res = await fetchLatestMASRates();
      if (mounted) {
        setMasRates(res.rates);
        setIsLiveRates(res.isLive);
        setLastUpdated(res.fetchedAt);
        setIsLoadingRates(false);
      }
    };
    loadRates();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefreshRates = useCallback(async () => {
    setIsLoadingRates(true);
    const res = await fetchLatestMASRates();
    setMasRates(res.rates);
    setIsLiveRates(res.isLive);
    setLastUpdated(res.fetchedAt);
    setIsLoadingRates(false);
  }, []);

  const handleUpdateParams = useCallback((newParams: Partial<LoanParameters>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const results = calculateLoanMetrics(params, masRates);

  const handleExportCSV = useCallback(() => {
    const schedule = generateAmortizationSchedule(
      params.loanAmount,
      results.effectiveRate,
      params.tenureYears
    );
    exportAmortizationCSV(
      schedule,
      params.loanAmount,
      results.effectiveRate,
      params.tenureYears
    );
  }, [params.loanAmount, results.effectiveRate, params.tenureYears]);

  const handleApplyPackage = useCallback(
    (benchmark: SORACompoundingMethod, margin: number) => {
      setParams((prev) => ({
        ...prev,
        benchmark,
        bankMargin: margin,
      }));
      setActiveTab('calculator');
    },
    []
  );

  const { rate: currentBenchVal } = getBenchmarkRate(
    masRates,
    params.benchmark,
    params.customSoraOverride
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportCSV={handleExportCSV}
        onReset={handleReset}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'calculator' && (
          <CalculatorView
            params={params}
            results={results}
            masRates={masRates}
            isLiveRates={isLiveRates}
            onUpdateParams={handleUpdateParams}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'rates' && (
          <RatesExplorer
            rates={masRates}
            isLive={isLiveRates}
            lastUpdated={lastUpdated}
            onRefresh={handleRefreshRates}
            isLoading={isLoadingRates}
          />
        )}

        {activeTab === 'sensitivity' && (
          <RateSensitivity
            loanAmount={params.loanAmount}
            tenureYears={params.tenureYears}
            bankMargin={params.bankMargin}
            currentBenchmarkRate={currentBenchVal}
          />
        )}

        {activeTab === 'packages' && (
          <PackageComparison
            loanAmount={params.loanAmount}
            tenureYears={params.tenureYears}
            sora1mRate={masRates[0]?.sora_1m ?? 2.87}
            sora3mRate={masRates[0]?.sora_3m ?? 2.95}
            onApplyPackage={handleApplyPackage}
          />
        )}
      </main>

      {/* Footer conforming to anti-slop rules (unboxed metadata, no ornamental engines) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
            <span>SORA Interest & Mortgage Calculator</span>
            <span aria-hidden="true">·</span>
            <span>Monetary Authority of Singapore (MAS) Benchmarks</span>
            <span aria-hidden="true">·</span>
            <span>Singapore ACT/365 Day Count Convention</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            For financial planning and estimation purposes. Bank rates and margins subject to individual package terms.
          </div>
        </div>
      </footer>
    </div>
  );
}
