import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type InputContainerProps = PropsWithChildren & {
  title: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const InputContainer = ({
  title,
  error,
  className,
  disabled = false,
  children,
}: InputContainerProps) => (
  <div className={cn('space-y-1.5', disabled && 'opacity-50 pointer-events-none', className)}>
    <Label>{title}</Label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default InputContainer;
