'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Mail, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminManagerUsers } from '@/data/services/companies.api';
import { sendAlertNotification } from '@/data/services/notifications.api';
import type {
  AlertsSummaryResponseDto,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { isValidEmail } from '@/lib/validators';

// Convert SCREAMING_SNAKE_CASE to camelCase for translation keys
const sectionKeyToTranslationKey = (key: string): string => {
  return key.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

interface AlertNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  machineId: string;
  companyId: string;
  alertsSummary: AlertsSummaryResponseDto;
}

export function AlertNotificationModal({
  open,
  onOpenChange,
  serviceId,
  machineId,
  companyId,
  alertsSummary,
}: AlertNotificationModalProps) {
  const t = useTranslations('alertNotification');
  const tMachines = useTranslations('machines');

  const [adminManagerUsers, setAdminManagerUsers] = useState<AdminManagerUserResponseDto[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);

  // Fetch admin/manager users when modal opens
  useEffect(() => {
    if (open && companyId) {
      setIsFetchingUsers(true);
      getAdminManagerUsers(companyId)
        .then((response) => {
          if (response.data) {
            setAdminManagerUsers(response.data);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch admin/manager users:', error);
        })
        .finally(() => {
          setIsFetchingUsers(false);
        });
    }
  }, [open, companyId]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleAddExtraEmail = () => {
    setExtraEmails((prev) => [...prev, '']);
  };

  const handleRemoveExtraEmail = (index: number) => {
    setExtraEmails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtraEmailChange = (index: number, value: string) => {
    setExtraEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  };

  const getValidExtraEmails = () => {
    return extraEmails.filter((email) => email.trim() && isValidEmail(email.trim()));
  };

  const handleSubmit = async () => {
    const validExtraEmails = getValidExtraEmails();

    if (selectedUserIds.length === 0 && validExtraEmails.length === 0) {
      toast.error(t('selectAtLeastOne'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendAlertNotification({
        serviceId,
        machineId,
        selectedUserIds,
        extraEmails: validExtraEmails,
      });

      if (response.errors) {
        toast.error(t('errorSending'));
        return;
      }

      const data = response.data;
      if (data) {
        toast.success(
          t('successMessage', {
            emails: data.emailsSent ?? 0,
            notifications: data.notificationsCreated ?? 0,
          }),
        );
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
      toast.error(t('errorSending'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const SeverityIcon = alertsSummary.highestSeverity === 'RED' ? AlertCircle : AlertTriangle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SeverityIcon
              className={`h-5 w-5 ${alertsSummary.highestSeverity === 'RED' ? 'text-red-500' : 'text-yellow-500'}`}
            />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { count: alertsSummary.alertCount })}
          </DialogDescription>
        </DialogHeader>

        {/* Alert Summary */}
        <div className="space-y-3 my-4">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {t('alertsSummary')}
          </h4>
          <div className="space-y-2">
            {alertsSummary.sections.map((section) => (
              <div
                key={section.sectionKey}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md min-w-0"
              >
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${section.severity === 'RED' ? 'bg-red-500' : 'bg-yellow-500'}`}
                />
                <span className="font-medium text-sm truncate min-w-0 flex-1">
                  {tMachines(`sectionNames.${sectionKeyToTranslationKey(section.sectionKey)}`)}
                </span>
                <Badge
                  variant={section.severity === 'RED' ? 'destructive' : 'secondary'}
                  className="shrink-0"
                >
                  {section.alerts.length}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {t('selectRecipients')}
          </h4>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500">{t('adminsAndManagers')}</Label>
            {isFetchingUsers ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : adminManagerUsers.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">{t('noAdminsFound')}</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {adminManagerUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.isCompanyAdmin ? t('admin') : t('manager')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extra Emails */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">{t('additionalEmails')}</Label>
            <div className="space-y-2">
              {extraEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={email}
                      onChange={(e) => handleExtraEmailChange(index, e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {extraEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExtraEmail(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExtraEmail}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('addEmail')}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
            {t('skip')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('sending')}
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {t('sendNotifications')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
