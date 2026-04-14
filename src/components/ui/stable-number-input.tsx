import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StableNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | string;
  onCommit: (val: number) => void;
  allowNegative?: boolean;
  /** Upper bound for accepted values (default: 10_000_000) */
  max?: number;
  /** Lower bound for accepted values (default: 0, or -max if allowNegative) */
  min?: number;
}

const StableNumberInput = React.forwardRef<HTMLInputElement, StableNumberInputProps>(
  ({ value, onCommit, allowNegative = false, max = 10_000_000, min, className, placeholder, ...props }, ref) => {
    const [local, setLocal] = useState(String(value ?? ''));
    const internalRef = useRef<HTMLInputElement | null>(null);

    // Sync external value → local only when the input is NOT focused
    useEffect(() => {
      if (document.activeElement === internalRef.current) return;
      setLocal(value === 0 || value === '' ? '' : String(value));
    }, [value]);

    const effectiveMin = min ?? (allowNegative ? -max : 0);

    const pattern = allowNegative ? /^-?\d*\.?\d{0,2}$/ : /^\d*\.?\d{0,2}$/;

    const commitValue = () => {
      const trimmed = local.replace(/^0+(?=\d)/, ''); // strip leading zeros
      const num = parseFloat(trimmed);
      if (isNaN(num)) {
        onCommit(0);
        setLocal('');
        return;
      }
      const clamped = Math.min(max, Math.max(effectiveMin, num));
      const rounded = Math.round(clamped * 100) / 100;
      onCommit(rounded);
      setLocal(rounded === 0 ? '' : String(rounded));
    };

    return (
      <input
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={local}
        onFocus={(e) => {
          // Select all on focus to prevent accidental append
          e.target.select();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '' || raw === '.' || (allowNegative && (raw === '-' || raw === '-.'))) {
            setLocal(raw);
            return;
          }
          if (pattern.test(raw)) {
            setLocal(raw);
          }
        }}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        {...props}
      />
    );
  },
);
StableNumberInput.displayName = 'StableNumberInput';

export { StableNumberInput };
