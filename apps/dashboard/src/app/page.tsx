import { getHelloWorld } from '@/data/services/example.api';

export default async function Home() {
  const result = await getHelloWorld();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{'title'}</h1>
        <p className="text-xl text-gray-600">{'description'}</p>
        <div>{result.data?.message}</div>
      </div>
    </main>
  );
}
