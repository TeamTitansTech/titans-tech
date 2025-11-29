import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { subdomain } = await params;

  return (
    <ThemeProvider subdomain={subdomain}>
      <AppLayout>{children}</AppLayout>
    </ThemeProvider>
  );
}
