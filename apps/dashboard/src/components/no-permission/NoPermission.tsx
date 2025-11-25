'use client';

import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';

interface NoPermissionProps {
  message?: string;
  description?: string;
  showContactAdmin?: boolean;
}

export function NoPermission({ message, description, showContactAdmin = true }: NoPermissionProps) {
  const router = useInternalRouter();
  const t = useTranslations('common');

  const handleGoToDashboard = () => {
    router.push('/home');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldOff className="w-8 h-8 text-destructive" />
            </div>

            {/* Main Message */}
            <div className="space-y-2">
              <Typography variant="h3">{message || t('noPermission.title')}</Typography>
              <Typography variant="muted" className="text-sm">
                {description || t('noPermission.description')}
              </Typography>
            </div>

            {/* Contact Admin Message */}
            {showContactAdmin && (
              <div className="p-3 bg-muted rounded-lg w-full">
                <Typography variant="small" className="text-muted-foreground">
                  {t('noPermission.contactMessage')}
                </Typography>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2 justify-center">
              <Button onClick={handleGoToDashboard} className="w-full sm:w-auto">
                {t('noPermission.goToDashboard')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
