'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, RotateCcw, Pipette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { updateCompany, type Company } from '@/data/services/companies.api';
import { toast } from 'sonner';

// EyeDropper API type declaration (not yet in TypeScript's lib)
declare global {
  interface EyeDropper {
    open(): Promise<{ sRGBHex: string }>;
  }
  interface EyeDropperConstructor {
    new (): EyeDropper;
  }
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

interface CompanyColorsSectionProps {
  selectedCompany?: Company;
}

const DEFAULT_BRAND_COLOR = '#1e3a5f';
const DEFAULT_ACCENT_COLOR = '#f97415';

export function CompanyColorsSection({ selectedCompany }: CompanyColorsSectionProps) {
  const t = useTranslations('adminSettings.companyColors');
  const [isSaving, setIsSaving] = useState(false);

  // Color states
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [originalBrandColor, setOriginalBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [originalAccentColor, setOriginalAccentColor] = useState(DEFAULT_ACCENT_COLOR);

  const hasChanges = brandColor !== originalBrandColor || accentColor !== originalAccentColor;

  // Update colors when company selection changes
  useEffect(() => {
    if (selectedCompany) {
      const brand = selectedCompany.brandColor || DEFAULT_BRAND_COLOR;
      const accent = selectedCompany.accentColor || DEFAULT_ACCENT_COLOR;
      setBrandColor(brand);
      setAccentColor(accent);
      setOriginalBrandColor(brand);
      setOriginalAccentColor(accent);
    }
  }, [selectedCompany]);

  const handleReset = () => {
    setBrandColor(originalBrandColor);
    setAccentColor(originalAccentColor);
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    setIsSaving(true);
    try {
      const response = await updateCompany({
        companyId: selectedCompany.id,
        data: { brandColor, accentColor },
      });

      if (response.errors) {
        toast.error(t('error'));
      } else {
        toast.success(t('success'));
        setOriginalBrandColor(brandColor);
        setOriginalAccentColor(accentColor);
      }
    } catch (error) {
      console.error('Error saving colors:', error);
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedCompany) return null;

  return (
    <div className="space-y-6 pt-6 border-t">
      <div className="flex items-center gap-3">
        <Palette className="h-5 w-5" />
        <div>
          <h3 className="text-base font-semibold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      {/* Color pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Color */}
        <div className="space-y-2">
          <Label>{t('brandColor')}</Label>
          <p className="text-xs text-muted-foreground">{t('brandColorDescription')}</p>
          <ColorPicker color={brandColor} onChange={setBrandColor} disabled={isSaving} />
        </div>

        {/* Accent Color */}
        <div className="space-y-2">
          <Label>{t('accentColor')}</Label>
          <p className="text-xs text-muted-foreground">{t('accentColorDescription')}</p>
          <ColorPicker color={accentColor} onChange={setAccentColor} disabled={isSaving} />
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>{t('preview')}</Label>
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex flex-col gap-2">
            <Button size="sm" style={{ backgroundColor: brandColor }} className="text-white">
              {t('previewPrimary')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              {t('previewOutline')}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" style={{ backgroundColor: accentColor }} className="text-white">
              {t('previewAccent')}
            </Button>
            <div
              className="px-3 py-1 rounded text-sm font-medium"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              {t('previewHighlight')}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {hasChanges && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('reset')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Check className="h-4 w-4 mr-1" />
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorPicker({ color, onChange, disabled }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color);
  const [isOpen, setIsOpen] = useState(false);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(false);

  // Check if EyeDropper API is supported
  useEffect(() => {
    setIsEyeDropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
  }, []);

  // Sync input value when color prop changes (from picker)
  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) return;

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const pickedColor = result.sRGBHex.toLowerCase();
      setInputValue(pickedColor);
      onChange(pickedColor);
    } catch {
      // User cancelled the eyedropper or it failed
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Ensure it starts with #
    if (!value.startsWith('#')) {
      value = '#' + value.replace('#', '');
    }

    // Only allow valid hex characters
    const cleanValue =
      '#' +
      value
        .slice(1)
        .replace(/[^0-9A-Fa-f]/g, '')
        .slice(0, 6);
    setInputValue(cleanValue);

    // Update color if valid 6-character hex
    if (/^#[0-9A-Fa-f]{6}$/i.test(cleanValue)) {
      onChange(cleanValue.toLowerCase());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={disabled}>
          <div
            className="w-6 h-6 rounded border mr-2 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={color} onChange={onChange} />
        <div className="mt-3 flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="font-mono text-sm h-8 flex-1"
            placeholder="#000000"
          />
          {isEyeDropperSupported && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleEyeDropper}
              title="Pick color from screen"
            >
              <Pipette className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
