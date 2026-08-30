'use client';

import { type ReactNode } from 'react';

interface FlowbitePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  prevHref?: string;
  nextHref?: string;
  prevLabel?: ReactNode;
  nextLabel?: ReactNode;
  className?: string;
}

export function FlowbitePagination({
  currentPage,
  totalPages,
  onPageChange,
  prevHref,
  nextHref,
  prevLabel = '← Previous',
  nextLabel = 'Next →',
  className = '',
}: FlowbitePaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between py-4 border-t border-border font-mono text-xs ${className}`}
    >
      <div>
        {prevHref ? (
          <a
            href={hasPrev ? prevHref : undefined}
            aria-disabled={!hasPrev}
            className={`px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              hasPrev
                ? 'border-border bg-surface text-text hover:bg-surface-2'
                : 'border-border-2 bg-surface/50 text-text-faint pointer-events-none'
            }`}
          >
            {prevLabel}
          </a>
        ) : (
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => onPageChange?.(currentPage - 1)}
            className={`px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              hasPrev
                ? 'border-border bg-surface text-text hover:bg-surface-2'
                : 'border-border-2 bg-surface/50 text-text-faint pointer-events-none'
            }`}
          >
            {prevLabel}
          </button>
        )}
      </div>

      <div className="text-text-muted">
        Page <span className="font-semibold text-text">{currentPage}</span> of{' '}
        <span className="font-semibold text-text">{totalPages}</span>
      </div>

      <div>
        {nextHref ? (
          <a
            href={hasNext ? nextHref : undefined}
            aria-disabled={!hasNext}
            className={`px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              hasNext
                ? 'border-border bg-surface text-text hover:bg-surface-2'
                : 'border-border-2 bg-surface/50 text-text-faint pointer-events-none'
            }`}
          >
            {nextLabel}
          </a>
        ) : (
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onPageChange?.(currentPage + 1)}
            className={`px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
              hasNext
                ? 'border-border bg-surface text-text hover:bg-surface-2'
                : 'border-border-2 bg-surface/50 text-text-faint pointer-events-none'
            }`}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
