'use client';

import { ReactNode, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SectionContainerProps {
  title: string;
  children: ReactNode;
  /** Controlled open state */
  isOpen?: boolean;
  /** Controlled open state handler */
  onOpenChange?: (open: boolean) => void;
  /** Default open state (only for uncontrolled mode) */
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function SectionContainer({
  title,
  children,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
}: SectionContainerProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);

  // Use controlled state if provided, otherwise use uncontrolled
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;
  const onOpenChange =
    controlledOnOpenChange !== undefined ? controlledOnOpenChange : setUncontrolledIsOpen;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className={className}>
      <div className="space-y-4">
        <CollapsibleTrigger
          className={cn(
            'flex items-center justify-between w-full group hover:opacity-80 transition-opacity',
            headerClassName,
          )}
        >
          <h4 className="text-lg font-semibold">{title}</h4>
          <ChevronDown
            className={cn('w-5 h-5 transition-transform duration-200', isOpen ? '' : 'rotate-180')}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className={contentClassName}>{children}</CollapsibleContent>
      </div>
    </Collapsible>
  );
}
