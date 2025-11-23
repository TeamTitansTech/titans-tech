'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

interface ThresholdRangeInputProps {
  label: string;
  greenMin: number;
  yellowMin: number;
  redMin: number;
  onGreenMinChange: (value: number) => void;
  onYellowMinChange: (value: number) => void;
  onRedMinChange: (value: number) => void;
}

export function ThresholdRangeInput({
  label,
  greenMin,
  yellowMin,
  redMin,
  onGreenMinChange,
  onYellowMinChange,
  onRedMinChange,
}: ThresholdRangeInputProps) {
  const t = useTranslations('alerts.thresholds');

  // Estado local para permitir digitação de valores temporários como "-"
  const [greenValue, setGreenValue] = useState(greenMin.toString());
  const [yellowValue, setYellowValue] = useState(yellowMin.toString());
  const [redValue, setRedValue] = useState(redMin.toString());

  // Função para validar máximo de 4 casas decimais
  const hasMaxFourDecimals = (value: string): boolean => {
    const parts = value.split('.');
    if (parts.length <= 1) return true; // Sem decimais ou apenas parte inteira
    return parts[1].length <= 4;
  };

  // Handler genérico para onChange
  const handleChange =
    (setValue: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (hasMaxFourDecimals(newValue)) {
        setValue(newValue);
      }
    };

  // Handler genérico para onBlur
  const handleBlur =
    (
      value: string,
      setValue: (value: string) => void,
      onChange: (value: number) => void,
      fallbackValue: number,
    ) =>
    () => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onChange(numValue);
      } else {
        // Reseta para o valor anterior se inválido
        setValue(fallbackValue.toString());
      }
    };

  // Sincroniza com props quando valores externos mudam
  useEffect(() => {
    setGreenValue(greenMin.toString());
  }, [greenMin]);

  useEffect(() => {
    setYellowValue(yellowMin.toString());
  }, [yellowMin]);

  useEffect(() => {
    setRedValue(redMin.toString());
  }, [redMin]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="h-10 w-full rounded-md overflow-hidden border border-gray-200">
        <div className="flex h-full">
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            &lt; {yellowMin}
          </div>

          <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {yellowMin} - &lt; {redMin}
          </div>

          <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            ≥ {redMin}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            {t('greenStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            value={greenValue}
            onChange={handleChange(setGreenValue)}
            onBlur={handleBlur(greenValue, setGreenValue, onGreenMinChange, greenMin)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            {t('yellowStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            min={greenMin}
            value={yellowValue}
            onChange={handleChange(setYellowValue)}
            onBlur={handleBlur(yellowValue, setYellowValue, onYellowMinChange, yellowMin)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            {t('redStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            min={yellowMin}
            value={redValue}
            onChange={handleChange(setRedValue)}
            onBlur={handleBlur(redValue, setRedValue, onRedMinChange, redMin)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
