'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: (keyof T) | ((item: T) => React.ReactNode);
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filterComponent?: React.ReactNode;
  bulkActions?: (selectedItems: T[]) => React.ReactNode;
  rowKey: (item: T) => string | number;
  initialSort?: { key: string; direction: 'asc' | 'desc' };
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  filterComponent,
  bulkActions,
  rowKey,
  initialSort,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    initialSort || null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter((item) => {
      const value = item[searchKey];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      // Find sortable value
      let valA: any = '';
      let valB: any = '';

      const key = sortConfig.key;
      // Find matching column sortAccessor or value
      const col = columns.find((c) => c.sortKey === key);
      if (col) {
        if (typeof col.accessor === 'function') {
          // Fallback to key accessor or toString representation if function
          valA = a[key as keyof T];
          valB = b[key as keyof T];
        } else {
          valA = a[col.accessor as keyof T];
          valB = b[col.accessor as keyof T];
        }
      } else {
        valA = a[key as keyof T];
        valB = b[key as keyof T];
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return sortConfig.direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
    });
  }, [filteredData, sortConfig, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelections = new Set(paginatedData.map(rowKey));
      setSelectedRows(newSelections);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (keyVal: string | number) => {
    const newSelections = new Set(selectedRows);
    if (newSelections.has(keyVal)) {
      newSelections.delete(keyVal);
    } else {
      newSelections.add(keyVal);
    }
    setSelectedRows(newSelections);
  };

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedRows.has(rowKey(item)));
  }, [data, selectedRows, rowKey]);

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedRows.has(rowKey(item)));

  return (
    <div className="space-y-4">
      {/* Top bar with Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {searchKey && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/3 border border-white/8 text-zinc-200 text-sm focus:outline-none focus:border-primary-gold/50 transition-all font-sans placeholder-zinc-600"
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 ml-auto">
          {filterComponent}
          {selectedRows.size > 0 && bulkActions && (
            <div className="animate-fade-in">
              {bulkActions(selectedItems)}
            </div>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-x-auto border border-white/5 bg-white/2 rounded-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/40 text-xs font-mono uppercase tracking-wider text-zinc-500">
              {bulkActions && (
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-light-gold focus:ring-light-gold/20 focus:ring-offset-0 accent-light-gold cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, idx) => {
                const isSortable = !!col.sortKey;
                const isSorted = sortConfig?.key === col.sortKey;
                return (
                  <th
                    key={idx}
                    onClick={() => isSortable && handleSort(col.sortKey!)}
                    className={`px-6 py-4 font-semibold ${col.className || ''} ${
                      isSortable ? 'cursor-pointer select-none hover:text-zinc-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {isSortable && isSorted && (
                        sortConfig?.direction === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5 text-light-gold" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-light-gold" />
                        )
                      )}
                      {isSortable && !isSorted && (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (bulkActions ? 1 : 0)} className="px-6 py-12 text-center text-zinc-500 font-mono">
                  No records match your selection.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const keyVal = rowKey(item);
                const isSelected = selectedRows.has(keyVal);

                return (
                  <tr
                    key={keyVal}
                    className={`hover:bg-white/3 transition-colors ${
                      isSelected ? 'bg-primary-gold/[0.03]' : ''
                    }`}
                  >
                    {bulkActions && (
                      <td className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(keyVal)}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-light-gold focus:ring-light-gold/20 focus:ring-offset-0 accent-light-gold cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => {
                      const content =
                        typeof col.accessor === 'function'
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode);

                      return (
                        <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-2 text-xs font-mono text-zinc-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/3 border border-white/8 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all text-xs ${
                      isCurrent
                        ? 'bg-primary-gold text-white border-primary-gold font-bold'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/3 border border-white/8 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/6 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
