'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PasswordFormProps {
  onSubmit: (password: string, confirmPassword: string) => Promise<void>;
  title?: string;
  description?: string;
  submitButtonText?: string;
  submittingButtonText?: string;
  translationNamespace?: string;
}

export default function PasswordForm({
  onSubmit,
  title,
  description,
  submitButtonText,
  submittingButtonText,
  translationNamespace = 'setPassword',
}: PasswordFormProps) {
  const t = useTranslations(translationNamespace);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(password, confirmPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{title || t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{description || t('description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">{t('form.password.label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('form.password.placeholder')}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{t('form.password.requirements')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('form.confirmPassword.label')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('form.confirmPassword.placeholder')}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submittingButtonText || t('form.submitting')}
              </>
            ) : (
              submitButtonText || t('form.submit')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
