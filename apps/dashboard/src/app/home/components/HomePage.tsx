'use client';
import { getHelloWorld } from '@/data/services/example.api';
import { useLazyQuery } from '@/hooks/useLazyQuery';

const delayedHelloWorld = async () => {
  await new Promise((r) => setTimeout(r, 2000));
  return await getHelloWorld();
};
export function HomePage() {
  const { isLoading, execute, result } = useLazyQuery(delayedHelloWorld);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button onClick={execute} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Message'}
      </button>
      <div>{result?.data?.message}</div>
    </main>
  );
}
