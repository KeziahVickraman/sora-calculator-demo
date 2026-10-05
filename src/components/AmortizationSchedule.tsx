/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AmortizationRow, AnnualAmortizationRow } from '../types/sora';

interface AmortizationScheduleProps {
  monthlySchedule: AmortizationRow[];
  annualSchedule: AnnualAmortizationRow[];
  onExportCSV: () => void;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  monthlySchedule,
  annualSchedule,
  onExportCSV,
}) => {
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 2 years at a time for monthly

  const filteredMonthly = useMemo(() => {
    if (!searchTerm) return monthlySchedule;
    return monthlySchedule.filter(
      (r) =>
        r.month.toString() === searchTerm ||
        r.year.toString() === searchTerm ||
        r.month.toString().includes(searchTerm)
    );
  }, [monthlySchedule, searchTerm]);

  const totalMonthlyPages = Math.ceil(filteredMonthly.length / itemsPerPage);

  const paginatedMonthly = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMonthly.slice(start, start + itemsPerPage);
  }, [filteredMonthly, currentPage]);

  const filteredAnnual = useMemo(() => {
    if (!searchTerm) return annualSchedule;
    return annualSchedule.filter((r) => r.year.toString().includes(searchTerm));
  }, [annualSchedule, searchTerm]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Amortization & Interest Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full principal and interest amortization curve based on Singapore ACT/365 convention
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setViewMode('annual');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Details
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={viewMode === 'annual' ? 'Filter year...' : 'Month or year...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:bg-white transition-colors w-32 sm:w-36 font-mono"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto mt-4">
        {viewMode === 'annual' ? (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2.5 px-3 font-medium">Year</th>
                <th className="py-2.5 px-3 font-medium text-right">Annual Payment</th>
                <th className="py-2.5 px-3 font-medium text-right">Principal Repaid</th>
                <th className="py-2.5 px-3 font-medium text-right">Interest Paid</th>
                <th className="py-2.5 px-3 font-medium text-right">Year-End Balance</th>
                <th className="py-2.5 px-3 font-medium text-right">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnnual.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No matching years found for &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredAnnual.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                      Year {row.year}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 font-mono tabular-nums">
                      ${row.annualPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-mono tabular-nums">
                      ${row.annualPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-mono tabular-nums">
                      ${row.annualInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-semibold font-mono tabular-nums">
                      ${row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono tabular-nums">
                      ${row.cumulativeInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2.5 px-3 font-medium">Month</th>
                <th className="py-2.5 px-3 font-medium">Year</th>
                <th className="py-2.5 px-3 font-medium text-right">Installment</th>
                <th className="py-2.5 px-3 font-medium text-right">Principal</th>
                <th className="py-2.5 px-3 font-medium text-right">Interest</th>
                <th className="py-2.5 px-3 font-medium text-right">Remaining Principal</th>
                <th className="py-2.5 px-3 font-medium text-right">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMonthly.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No matching months found
                  </td>
                </tr>
              ) : (
                paginatedMonthly.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-900 font-mono">
                      M{row.month}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono">
                      Yr {row.year}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800 font-mono tabular-nums">
                      ${row.payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-mono tabular-nums">
                      ${row.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 font-mono tabular-nums">
                      ${row.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 font-semibold font-mono tabular-nums">
                      ${row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono tabular-nums">
                      ${row.cumulativeInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination for monthly view */}
      {viewMode === 'monthly' && totalMonthlyPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredMonthly.length)} of{' '}
            {filteredMonthly.length} months
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono">
              Page {currentPage} of {totalMonthlyPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalMonthlyPages, p + 1))}
              disabled={currentPage === totalMonthlyPages}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
