import { getHelloWorld } from '@/data/services/example.api';
import Link from 'next/link';

export default async function Home() {
  const result = await getHelloWorld();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{'title'}</h1>
        <p className="text-xl text-gray-600">{'description'}</p>
        <div>{result.data?.message}</div>
        <Link href="/home" className="text-blue-500 hover:underline">
          HOME
        </Link>
      </div>
    </main>
  );
}
