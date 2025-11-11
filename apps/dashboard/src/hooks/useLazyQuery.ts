'use client';
import { useState } from 'react';

// Generic hook that wraps async query functions
// Uses generic constraints to preserve type safety for callback functions
export const useLazyQuery = <TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TResult | null>(null);
  const execute = async (...args: TArgs): Promise<TResult> => {
    setIsLoading(true);
    try {
      const result = await callback(...args);
      setResult(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };
  return { execute, isLoading, result };
};
