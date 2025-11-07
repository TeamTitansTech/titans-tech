import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('client');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('description')}</p>
      </div>
    </main>
  );
}
