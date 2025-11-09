'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface ConditionalTooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function ConditionalTooltip({ content, children, className }: ConditionalTooltipProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const checkTruncation = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check the first child element if it exists (for component children)
    // Otherwise check the wrapper element itself (for text children)
    const contentElement = (element.firstElementChild as HTMLElement) || element;

    // Add a small threshold (2px) to account for browser rounding errors
    // Only consider truncated if the difference is significant
    const THRESHOLD = 2;

    // Check if element is truncated (for single line with text-overflow: ellipsis)
    const isSingleLineTruncated = contentElement.scrollWidth - contentElement.clientWidth > THRESHOLD;

    // Check if element is truncated (for multi-line with line-clamp)
    const isMultiLineTruncated = contentElement.scrollHeight - contentElement.clientHeight > THRESHOLD;

    const truncated = isSingleLineTruncated || isMultiLineTruncated;
    setIsTruncated(truncated);
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to ensure layout is complete before checking
    // This is more reliable than setTimeout for layout measurements
    const rafId = requestAnimationFrame(() => {
      // Double-rAF to ensure paint is complete
      requestAnimationFrame(checkTruncation);
    });

    // Re-check on window resize
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize checks with requestAnimationFrame
      requestAnimationFrame(checkTruncation);
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [content, checkTruncation]);

  if (!isTruncated) {
    return (
      <div ref={elementRef} className={`${className || ''} min-w-0`.trim()}>
        {children}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={elementRef} className={`${className || ''} min-w-0`.trim()}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs break-words">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
