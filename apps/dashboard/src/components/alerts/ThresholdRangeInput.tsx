'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="h-10 w-full rounded-md overflow-hidden border border-gray-200">
        <div className="flex h-full">
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            &lt; {yellowMin.toFixed(3)}
          </div>

          <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {yellowMin.toFixed(3)} - {(redMin - 0.001).toFixed(3)}
          </div>

          <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {redMin.toFixed(3)}+
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Green Start (Min)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={greenMin}
            onChange={(e) => onGreenMinChange(parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            Yellow Start (Min)
          </Label>
          <Input
            type="number"
            step="0.01"
            min={greenMin}
            value={yellowMin}
            onChange={(e) => onYellowMinChange(parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Red Start (Min)
          </Label>
          <Input
            type="number"
            step="0.01"
            min={yellowMin}
            value={redMin}
            onChange={(e) => onRedMinChange(parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
