import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StableNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | string;
  onCommit: (val: number) => void;
  allowNegative?: boolean;
}

const StableNumberInput = React.forwardRef<HTMLInputElement, StableNumberInputProps>(
  ({ value, onCommit, allowNegative = false, className, placeholder, ...props }, ref) => {
    const [local, setLocal] = useState(String(value ?? ''));

    useEffect(() => {
      setLocal(value === 0 || value === '' ? '' : String(value));
    }, [value]);

    const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={local}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '' || pattern.test(raw)) {
            setLocal(raw);
          }
        }}
        onBlur={() => {
          const num = parseFloat(local);
          onCommit(isNaN(num) ? 0 : num);
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
