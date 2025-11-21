'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createUrgentRequest } from '@/data/services/notifications.api';
import { useTranslations } from 'next-intl';

interface UrgentServiceModalProps {
  machineId: string;
  machineName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UrgentServiceModal({
  machineId,
  machineName,
  open,
  onOpenChange,
}: UrgentServiceModalProps) {
  const t = useTranslations('machines');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const result = await createUrgentRequest({
        machineId,
        notes: notes.trim() || undefined,
      });

      if (result.data && result.data.success) {
        setSubmitStatus('success');

        setTimeout(() => {
          setNotes('');
          setSubmitStatus('idle');
          onOpenChange(false);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(
          result.errors?.[0] || 'Failed to create urgent service request. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error creating urgent service request:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setNotes('');
      setSubmitStatus('idle');
      setErrorMessage('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🚨 {t('requestUrgentService')}
            </DialogTitle>
            <DialogDescription>{t('urgentServiceDescription', { machineName })}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="machine-name">{t('machine')}</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">{machineName}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">
                {t('additionalNotes')}{' '}
                <span className="text-muted-foreground">({t('optional')})</span>
              </Label>
              <Textarea
                id="notes"
                placeholder={t('urgentServiceNotesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isSubmitting || submitStatus === 'success'}
              />
              <p className="text-xs text-muted-foreground">{t('urgentServiceNotesHint')}</p>
            </div>

            {submitStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('urgentServiceRequestSent')}
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || t('urgentServiceRequestError')}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{t('urgentServiceWarning')}</AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitStatus === 'success' ? t('requestSent') : t('sendUrgentRequest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
