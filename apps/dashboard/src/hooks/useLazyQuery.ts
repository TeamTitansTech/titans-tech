/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';

export const useLazyQuery = <T extends (...args: any[]) => Promise<any>>(callback: T) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<T> | null>>(null);
  const execute = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
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
