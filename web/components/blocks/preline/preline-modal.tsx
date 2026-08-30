'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface PrelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  kicker?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function PrelineModal({
  isOpen,
  onClose,
  title,
  kicker,
  children,
  footer,
  maxWidth = 'lg',
  className = '',
}: PrelineModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklch,var(--color-bg)_80%,transparent)] backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={dialogRef}
        className={`w-full ${widthClass} border border-border bg-surface rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${className}`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-surface-2">
          <div>
            {kicker && (
              <p className="font-mono text-xs uppercase tracking-wider text-pink font-semibold">
                {kicker}
              </p>
            )}
            <h2 className="font-display text-lg sm:text-xl font-bold text-text">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-sm text-text-muted hover:text-text hover:bg-surface-3 transition-colors duration-150"
          >
            <span className="text-xl leading-none font-mono">✕</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto font-body space-y-4">
          {children}
        </div>

        {footer && (
          <div className="p-4 sm:p-6 border-t border-border bg-surface-2 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
