'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface StepBadge {
  label: string;
  variant: 'success' | 'info';
}

export interface StepperStep {
  key: string;
  label: string;
  status: 'pending' | 'current' | 'completed';
  badges?: StepBadge[];
  isClickable?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  onStepClick?: (stepIndex: number) => void;
}

interface StepperItemProps {
  step: StepperStep;
  stepNumber: number;
  isLast: boolean;
  onClick?: () => void;
}

function StepperItem({ step, stepNumber, isLast, onClick }: StepperItemProps) {
  const isClickable = step.isClickable !== false;
  const stepRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-start flex-shrink-0 lg:flex-1 lg:last:flex-none">
      <div
        className="flex flex-col items-center flex-shrink-0 relative"
        ref={stepRef}
        data-step-status={step.status}
      >
        <button
          type="button"
          onClick={isClickable ? onClick : undefined}
          disabled={!isClickable}
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            step.status === 'pending' &&
              'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            step.status === 'current' && 'bg-blue-500 text-white ring-2 ring-blue-300',
            step.status === 'completed' && 'bg-green-600 text-white',
            isClickable && 'hover:opacity-80',
          )}
        >
          {step.status === 'completed' ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <span>{stepNumber}</span>
          )}
        </button>

        <div
          className={cn(
            'text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 text-center w-[70px] sm:w-[100px] min-h-[28px] sm:min-h-[32px] line-clamp-2',
            step.status === 'pending' && 'text-gray-500 dark:text-gray-400',
            step.status === 'current' && 'text-foreground font-semibold',
            step.status === 'completed' && 'text-green-700 dark:text-green-400',
          )}
        >
          {step.label}
        </div>

        {/* Custom Badges */}
        {step.badges && step.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 justify-center max-w-[70px] sm:max-w-[100px]">
            {step.badges.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                  badge.variant === 'success' &&
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700',
                  badge.variant === 'info' &&
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
                )}
              >
                <Check className="w-2.5 h-2.5" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connecting Line - positioned between steps */}
      {!isLast && (
        <div className="h-0.5 bg-blue-500 flex-shrink-0 w-[40px] sm:w-[50px] lg:flex-1 self-start mt-[15px] sm:mt-[19px]" />
      )}
    </div>
  );
}

export function Stepper({ steps, onStepClick }: StepperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (containerRef.current) {
      const currentStepElement = containerRef.current.querySelector('[data-step-status="current"]');
      if (currentStepElement) {
        currentStepElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [steps]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startX;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full p-4 sm:p-4 bg-muted/30 rounded-lg border relative">
      <div
        ref={containerRef}
        className={cn(
          'hide-scrollbar flex items-center overflow-x-auto select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {steps.map((step, index) => (
          <StepperItem
            key={step.key}
            step={step}
            stepNumber={index + 1}
            isLast={index === steps.length - 1}
            onClick={() => onStepClick?.(index)}
          />
        ))}
      </div>
    </div>
  );
}
