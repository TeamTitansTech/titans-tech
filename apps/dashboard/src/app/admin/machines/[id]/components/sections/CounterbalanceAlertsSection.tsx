'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Plus, X, AlertTriangle, Pencil, Trash2, Check } from 'lucide-react';
import { CounterbalanceAlertField } from '@/data/types/services.types';
import { responseHandler } from '@/data/helpers/responseHandler';

interface CounterbalanceCylinderAlert {
  id: string;
  machineServiceId: string;
  fieldName: CounterbalanceAlertField;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

interface CounterbalanceAlertsSectionProps {
  serviceId?: string;
}

export function CounterbalanceAlertsSection({ serviceId }: CounterbalanceAlertsSectionProps) {
  const t = useTranslations('inspections.form.counterbalanceCylinder.alerts');

  // Alerts state
  const [alerts, setAlerts] = useState<CounterbalanceCylinderAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [selectedField, setSelectedField] = useState<CounterbalanceAlertField | ''>('');
  const [justification, setJustification] = useState('');
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  // Edit state
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [editJustification, setEditJustification] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!serviceId) return;

    setIsLoadingAlerts(true);
    try {
      const response = await responseHandler<CounterbalanceCylinderAlert[]>(
        `/alerts/counterbalance/service/${serviceId}`,
      );

      if (response.data) {
        setAlerts(response.data);
      } else if (response.errors) {
        console.error('Failed to fetch alerts:', response.errors);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [serviceId]);

  // Fetch alerts when serviceId is available
  useEffect(() => {
    if (serviceId) {
      fetchAlerts();
    }
  }, [serviceId, fetchAlerts]);

  const handleSaveAlert = async () => {
    if (!selectedField || !justification.trim() || !serviceId) {
      toast.error(t('toast.selectFieldAndJustification'));
      return;
    }

    setIsSavingAlert(true);
    try {
      const response = await responseHandler<CounterbalanceCylinderAlert>(
        `/alerts/counterbalance/service/${serviceId}`,
        {
          method: 'POST',
          body: {
            fieldName: selectedField,
            justification: justification.trim(),
          },
        },
      );

      if (response.data) {
        setAlerts((prev) => [response.data!, ...prev]);
        setSelectedField('');
        setJustification('');
        setIsAddingAlert(false);
        toast.success(t('toast.createSuccess'));
      } else if (response.errors) {
        toast.error(response.errors[0] || t('toast.createError'));
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error(t('toast.createError'));
    } finally {
      setIsSavingAlert(false);
    }
  };

  const availableFields = useMemo(() => {
    const allFields = Object.values(CounterbalanceAlertField);
    const usedFields = alerts.map((alert) => alert.fieldName);
    return allFields.filter((field) => !usedFields.includes(field));
  }, [alerts]);

  const getFieldLabel = (field: CounterbalanceAlertField): string => {
    return t(`fieldLabels.${field}`);
  };

  const handleEditClick = (alert: CounterbalanceCylinderAlert) => {
    setEditingAlertId(alert.id);
    setEditJustification(alert.justification);
  };

  const handleCancelEdit = () => {
    setEditingAlertId(null);
    setEditJustification('');
  };

  const handleSaveEdit = async (alertId: string) => {
    if (!editJustification.trim()) {
      toast.error(t('toast.justificationRequired'));
      return;
    }

    setIsSavingEdit(true);
    try {
      const response = await responseHandler<CounterbalanceCylinderAlert>(
        `/alerts/counterbalance/${alertId}`,
        {
          method: 'PUT',
          body: {
            justification: editJustification.trim(),
          },
        },
      );

      if (response.data) {
        setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? response.data! : alert)));
        setEditingAlertId(null);
        setEditJustification('');
        toast.success(t('toast.updateSuccess'));
      } else if (response.errors) {
        toast.error(response.errors[0] || t('toast.updateError'));
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
      toast.error(t('toast.updateError'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    setIsDeletingId(alertId);
    try {
      const response = await responseHandler(`/alerts/counterbalance/${alertId}`, {
        method: 'DELETE',
      });

      if (response.data || !response.errors) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        toast.success(t('toast.deleteSuccess'));
      } else if (response.errors) {
        toast.error(response.errors[0] || t('toast.deleteError'));
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
      toast.error(t('toast.deleteError'));
    } finally {
      setIsDeletingId(null);
    }
  };

  // Don't render if serviceId is missing
  if (!serviceId) {
    return null;
  }

  return (
    <>
      <Separator className="my-6" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            {t('title')} ({alerts.length})
          </h3>
        </div>

        {/* Alerts List */}
        {isLoadingAlerts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4 border-red-200 bg-red-50/50">
                {editingAlertId === alert.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {getFieldLabel(alert.fieldName)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">({t('editing')})</span>
                    </div>
                    <Textarea
                      value={editJustification}
                      onChange={(e) => setEditJustification(e.target.value)}
                      placeholder={t('justificationPlaceholder')}
                      className="text-sm"
                      rows={3}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {editJustification.length}/1000 {t('characters')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSavingEdit}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t('cancel')}
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleSaveEdit(alert.id)}
                        disabled={isSavingEdit || !editJustification.trim()}
                        className="flex-1"
                      >
                        {isSavingEdit ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('saving')}
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            {t('save')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {getFieldLabel(alert.fieldName)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.justification}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('createdAt')}: {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(alert)}
                        disabled={isDeletingId === alert.id}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                        disabled={isDeletingId === alert.id}
                        className="h-8 w-8 p-0"
                      >
                        {isDeletingId === alert.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{t('noAlerts')}</p>
        )}

        {/* Add Alert Form */}
        {!isAddingAlert && availableFields.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingAlert(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addNew')}
          </Button>
        ) : null}

        {isAddingAlert && (
          <Card className="p-4 border-orange-200 bg-orange-50/30">
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert-field" className="text-xs font-medium mb-2 block">
                  {t('fieldWithProblem')} *
                </Label>
                <Select
                  value={selectedField}
                  onValueChange={(value) => setSelectedField(value as CounterbalanceAlertField)}
                >
                  <SelectTrigger id="alert-field" className="text-sm">
                    <SelectValue placeholder={t('selectField')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field} value={field} className="text-sm">
                        {getFieldLabel(field)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alert-justification" className="text-xs font-medium mb-2 block">
                  {t('justification')} *
                </Label>
                <Textarea
                  id="alert-justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder={t('justificationPlaceholder')}
                  className="text-sm"
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {justification.length}/1000 {t('characters')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingAlert(false);
                    setSelectedField('');
                    setJustification('');
                  }}
                  disabled={isSavingAlert}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('cancel')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleSaveAlert}
                  disabled={isSavingAlert || !selectedField || !justification.trim()}
                  className="flex-1"
                >
                  {isSavingAlert ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {availableFields.length === 0 && !isAddingAlert && (
          <p className="text-xs text-muted-foreground text-center">{t('allFieldsHaveAlerts')}</p>
        )}
      </div>
    </>
  );
}
