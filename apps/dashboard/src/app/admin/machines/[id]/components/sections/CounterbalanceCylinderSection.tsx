'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import {
  type CounterbalanceCylinderData,
  type CounterbalanceCylinderCheck,
  ServiceType,
  CounterbalanceAlertField,
} from '@/data/types/services.types';
import { CounterbalanceCylinderForm } from '../forms/CounterbalanceCylinderForm';
import { isDataTouched } from './utils';

export const defaultCounterbalanceCylinderData: CounterbalanceCylinderData = {
  counterbalanceType: undefined,
  airbagPistonSeals: undefined,
  airbagPistonSealsLeakLocation: '',
  regulator: undefined,
  gauge: undefined,
  pneumaticsPlumbing: undefined,
  rodSeals: undefined,
  rodBushing: undefined,
  oilWick: undefined,
};

export const validateCounterbalanceCylinderData = (data: CounterbalanceCylinderData): string[] => {
  const errors: string[] = [];

  const requiredStringFields: (keyof CounterbalanceCylinderData)[] = [
    'counterbalanceType',
    'airbagPistonSeals',
    'regulator',
    'gauge',
    'pneumaticsPlumbing',
    'rodSeals',
    'rodBushing',
    'oilWick',
  ];

  requiredStringFields.forEach((field) => {
    const value = data[field];
    // Only validate if field exists in data
    if (value !== undefined && (!value || typeof value !== 'string')) {
      errors.push(`${String(field)} is required and must be a valid value`);
    }
  });

  if (data.airbagPistonSeals === 'LEAKING') {
    const leakLocation = data.airbagPistonSealsLeakLocation;
    if (
      leakLocation !== undefined &&
      (!leakLocation || typeof leakLocation !== 'string' || !leakLocation.trim())
    ) {
      errors.push('airbagPistonSealsLeakLocation is required when seals are LEAKING');
    }
  }

  return errors;
};

export interface CounterbalanceCylinderSectionRef {
  getData: () => CounterbalanceCylinderCheck | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: CounterbalanceCylinderCheck;
  };
}

interface CounterbalanceCylinderAlert {
  id: string;
  machineServiceId: string;
  fieldName: CounterbalanceAlertField;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

interface CounterbalanceCylinderSectionProps {
  onSectionTouched: () => void;
  serviceType?: ServiceType;
  initialData?: CounterbalanceCylinderCheck;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  serviceId?: string; // Service ID for alerts functionality
  machineId?: string; // Machine ID for API calls
}

export const CounterbalanceCylinderSection = forwardRef<
  CounterbalanceCylinderSectionRef,
  CounterbalanceCylinderSectionProps
>(({ onSectionTouched, initialData, serviceId, machineId }, ref) => {
  const t = useTranslations('inspections.form.counterbalanceCylinder');

  // Store initial loaded data for "touched" detection
  const [initialOuterData] = useState<CounterbalanceCylinderData>(
    initialData?.outerData || defaultCounterbalanceCylinderData,
  );
  const [initialInnerData] = useState<CounterbalanceCylinderData>(
    initialData?.innerData || defaultCounterbalanceCylinderData,
  );

  const [outerData, setOuterData] = useState<CounterbalanceCylinderData>(
    initialData?.outerData || defaultCounterbalanceCylinderData,
  );
  const [innerData, setInnerData] = useState<CounterbalanceCylinderData>(
    initialData?.innerData || defaultCounterbalanceCylinderData,
  );
  const [sharedNotes, setSharedNotes] = useState<string>(initialData?.notes || '');
  const [errors, setErrors] = useState<{
    outer: Record<string, string>;
    inner: Record<string, string>;
  }>({
    outer: {},
    inner: {},
  });

  // Alerts state
  const [alerts, setAlerts] = useState<CounterbalanceCylinderAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [selectedField, setSelectedField] = useState<CounterbalanceAlertField | ''>('');
  const [justification, setJustification] = useState('');
  const [isSavingAlert, setIsSavingAlert] = useState(false);

  const updateOuterField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setOuterData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, outer: { ...prev.outer, [field]: '' } }));
    onSectionTouched();
  };

  const updateInnerField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setInnerData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, inner: { ...prev.inner, [field]: '' } }));
    onSectionTouched();
  };

  // Fetch alerts when serviceId is available
  useEffect(() => {
    if (serviceId && machineId) {
      fetchAlerts();
    }
  }, [serviceId, machineId]);

  const fetchAlerts = async () => {
    if (!serviceId || !machineId) return;

    setIsLoadingAlerts(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/alerts/counterbalance/service/${serviceId}`,
        {
          credentials: 'include',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleSaveAlert = async () => {
    if (!selectedField || !justification.trim() || !serviceId || !machineId) {
      toast.error('Selecione um campo e forneça uma justificativa');
      return;
    }

    setIsSavingAlert(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/alerts/counterbalance/service/${serviceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            fieldName: selectedField,
            justification: justification.trim(),
          }),
        },
      );

      if (response.ok) {
        const newAlert = await response.json();
        setAlerts((prev) => [newAlert, ...prev]);
        setSelectedField('');
        setJustification('');
        setIsAddingAlert(false);
        toast.success('Alerta criado com sucesso');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao criar alerta');
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      toast.error('Erro ao criar alerta');
    } finally {
      setIsSavingAlert(false);
    }
  };

  const getAvailableFields = (): CounterbalanceAlertField[] => {
    const allFields = Object.values(CounterbalanceAlertField);
    const usedFields = alerts.map((alert) => alert.fieldName);
    return allFields.filter((field) => !usedFields.includes(field));
  };

  const getFieldLabel = (field: CounterbalanceAlertField): string => {
    const labels: Record<CounterbalanceAlertField, string> = {
      [CounterbalanceAlertField.AIRBAG_PISTON_SEALS]: 'Airbag/Piston Seals',
      [CounterbalanceAlertField.REGULATOR]: 'Regulator',
      [CounterbalanceAlertField.GAUGE]: 'Gauge',
      [CounterbalanceAlertField.PNEUMATICS_PLUMBING]: 'Pneumatics Plumbing',
      [CounterbalanceAlertField.ROD_SEALS]: 'Rod Seals',
      [CounterbalanceAlertField.ROD_BUSHING]: 'Rod Bushing',
      [CounterbalanceAlertField.OIL_WICK]: 'Oil Wick',
    };
    return labels[field] || field;
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      const outerTouched = isDataTouched(outerData, initialOuterData);
      const innerTouched = isDataTouched(innerData, initialInnerData);
      const notesTouched = sharedNotes.trim() !== '';
      return outerTouched || innerTouched || notesTouched;
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): {
      isValid: boolean;
      errors: string[];
      data?: CounterbalanceCylinderCheck;
    } => {
      const outerTouched = isDataTouched(outerData, initialOuterData);
      const innerTouched = isDataTouched(innerData, initialInnerData);

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerTouched || isDataTouched(initialOuterData, defaultCounterbalanceCylinderData);
      const hasInnerData =
        innerTouched || isDataTouched(initialInnerData, defaultCounterbalanceCylinderData);

      // If no data at all (initial or touched), validation passes with no data
      if (!hasOuterData && !hasInnerData) {
        return { isValid: true, errors: [] };
      }

      const outerErrors = outerTouched
        ? validateCounterbalanceCylinderData(outerData).map((e) => `Outer: ${e}`)
        : [];
      const innerErrors = innerTouched
        ? validateCounterbalanceCylinderData(innerData).map((e) => `Inner: ${e}`)
        : [];
      const allErrors = [...outerErrors, ...innerErrors];
      const isValid = allErrors.length === 0;

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          data: {
            outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
            innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
            notes: sharedNotes,
          },
        };
      }

      return {
        isValid: false,
        errors: allErrors,
      };
    },

    getData: (): CounterbalanceCylinderCheck | undefined => {
      const outerTouched = isDataTouched(outerData, initialOuterData);
      const innerTouched = isDataTouched(innerData, initialInnerData);

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerTouched || isDataTouched(initialOuterData, defaultCounterbalanceCylinderData);
      const hasInnerData =
        innerTouched || isDataTouched(initialInnerData, defaultCounterbalanceCylinderData);

      if (!hasOuterData && !hasInnerData) {
        return undefined;
      }

      return {
        outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
        innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
        notes: sharedNotes,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const outerTouched = isDataTouched(outerData, initialOuterData);
      const innerTouched = isDataTouched(innerData, initialInnerData);

      const outerErrors = outerTouched
        ? validateCounterbalanceCylinderData(outerData).map((e) => `Outer: ${e}`)
        : [];
      const innerErrors = innerTouched
        ? validateCounterbalanceCylinderData(innerData).map((e) => `Inner: ${e}`)
        : [];

      return [...outerErrors, ...innerErrors];
    },

    reset: () => {
      setOuterData(defaultCounterbalanceCylinderData);
      setInnerData(defaultCounterbalanceCylinderData);
      setSharedNotes('');
      setErrors({ outer: {}, inner: {} });
    },
  }));

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="outer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
          <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
        </TabsList>

        <TabsContent value="outer" className="space-y-6">
          <CounterbalanceCylinderForm
            data={outerData}
            updateFn={updateOuterField}
            errors={errors.outer}
            title=""
          />
        </TabsContent>

        <TabsContent value="inner" className="space-y-6">
          <CounterbalanceCylinderForm
            data={innerData}
            updateFn={updateInnerField}
            errors={errors.inner}
            title=""
          />
        </TabsContent>
      </Tabs>

      <div className="pt-6 border-t">
        <Label htmlFor="shared-notes" className="text-xs font-medium mb-2 block">
          {t('notes')}
        </Label>
        <Textarea
          id="shared-notes"
          value={sharedNotes}
          onChange={(e) => {
            setSharedNotes(e.target.value);
            onSectionTouched();
          }}
          placeholder={t('notes')}
          className="text-sm"
          rows={3}
        />
      </div>

      {/* Alerts Section */}
      {serviceId && machineId && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                🔴 Alertas Críticos ({alerts.length})
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {getFieldLabel(alert.fieldName)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.justification}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado em: {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum alerta crítico registrado
              </p>
            )}

            {/* Add Alert Form */}
            {!isAddingAlert && getAvailableFields().length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingAlert(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Alerta
              </Button>
            ) : null}

            {isAddingAlert && (
              <Card className="p-4 border-orange-200 bg-orange-50/30">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="alert-field" className="text-xs font-medium mb-2 block">
                      Campo com Problema *
                    </Label>
                    <Select
                      value={selectedField}
                      onValueChange={(value) => setSelectedField(value as CounterbalanceAlertField)}
                    >
                      <SelectTrigger id="alert-field" className="text-sm">
                        <SelectValue placeholder="Selecione um campo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableFields().map((field) => (
                          <SelectItem key={field} value={field} className="text-sm">
                            {getFieldLabel(field)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="alert-justification" className="text-xs font-medium mb-2 block">
                      Justificativa *
                    </Label>
                    <Textarea
                      id="alert-justification"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Descreva o problema (ex: vazamento devido a quebra de engrenagem)"
                      className="text-sm"
                      rows={3}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {justification.length}/1000 caracteres
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
                      Cancelar
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
                          Salvando...
                        </>
                      ) : (
                        <>Salvar Alerta 🔴</>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {getAvailableFields().length === 0 && !isAddingAlert && (
              <p className="text-xs text-muted-foreground text-center">
                Todos os campos já possuem alertas registrados
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
});

CounterbalanceCylinderSection.displayName = 'CounterbalanceCylinderSection';
