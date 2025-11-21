'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Calendar, FileText, Wrench, Settings } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const t = useTranslations('dashboard.client.quickActions');

  const actions = [
    {
      icon: Wrench,
      label: t('viewMachines'),
      description: t('viewMachinesDesc'),
      href: '/machines',
      variant: 'default' as const,
    },
    {
      icon: Calendar,
      label: t('viewServices'),
      description: t('viewServicesDesc'),
      href: '/services',
      variant: 'outline' as const,
    },
    {
      icon: FileText,
      label: t('viewReports'),
      description: t('viewReportsDesc'),
      href: '/machines', // Could be /reports when that's created
      variant: 'outline' as const,
    },
    {
      icon: Settings,
      label: t('settings'),
      description: t('settingsDesc'),
      href: '/settings',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={`${action.href}-${index}`}
                variant={action.variant}
                asChild
                className="h-auto py-6 flex-col items-start gap-2"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left font-normal">
                    {action.description}
                  </p>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
