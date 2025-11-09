'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Languages, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
] as const;

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleLanguageChange = (newLocale: string) => {
    setSelectedLocale(newLocale);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="space-y-6 py-4">
          {/* Language Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">{t('language.title')}</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('language.label')}</Label>
              <Select
                value={selectedLocale}
                onValueChange={handleLanguageChange}
                disabled={isPending}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((loc) => (
                    <SelectItem key={loc.code} value={loc.code}>
                      <div className="flex items-center gap-2">
                        <span>{loc.flag}</span>
                        <span>{loc.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('language.description')}
              </p>
            </div>
          </section>

          <Separator />

          {/* Future sections can be added here */}
          {/* Example: Theme, Notifications, etc. */}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500"
          >
            {t('close')}
          </Button>
        </div>

        {isPending && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-orange-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">{t('applying')}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
