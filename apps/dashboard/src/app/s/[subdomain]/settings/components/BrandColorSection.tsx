'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCompany, updateCompany } from '@/data/services/companies.api';
import { toast } from 'sonner';

const DEFAULT_BRAND_COLOR = '#1e3a5f';
const DEFAULT_ACCENT_COLOR = '#f97415';

export function BrandColorSection() {
  const t = useTranslations('settings.brandColor');
  const { companyUser } = useCompanyUser();
  const { updateBrandColor, updateAccentColor } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Brand color states
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [originalBrandColor, setOriginalBrandColor] = useState(DEFAULT_BRAND_COLOR);

  // Accent color states
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [originalAccentColor, setOriginalAccentColor] = useState(DEFAULT_ACCENT_COLOR);

  const hasChanges = brandColor !== originalBrandColor || accentColor !== originalAccentColor;

  // Only show for company admins
  const canEdit = companyUser?.isCompanyAdmin;

  useEffect(() => {
    async function loadCompany() {
      if (!companyUser?.companyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getCompany({ companyId: companyUser.companyId });
        if (response.data) {
          const brand = response.data.brandColor || DEFAULT_BRAND_COLOR;
          const accent = response.data.accentColor || DEFAULT_ACCENT_COLOR;
          setBrandColor(brand);
          setAccentColor(accent);
          setOriginalBrandColor(brand);
          setOriginalAccentColor(accent);
        }
      } catch (error) {
        console.error('Error loading company:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompany();
  }, [companyUser?.companyId]);

  const handleBrandColorChange = (color: string) => {
    setBrandColor(color);
    updateBrandColor(color);
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    updateAccentColor(color);
  };

  const handleReset = () => {
    setBrandColor(originalBrandColor);
    setAccentColor(originalAccentColor);
    updateBrandColor(originalBrandColor);
    updateAccentColor(originalAccentColor);
  };

  const handleSave = async () => {
    if (!companyUser?.companyId) return;

    setIsSaving(true);
    try {
      const response = await updateCompany({
        companyId: companyUser.companyId,
        data: { brandColor, accentColor },
      });

      if (response.errors) {
        toast.error(t('error'));
        handleReset();
      } else {
        toast.success(t('success'));
        setOriginalBrandColor(brandColor);
        setOriginalAccentColor(accentColor);
      }
    } catch (error) {
      console.error('Error saving colors:', error);
      toast.error(t('error'));
      handleReset();
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5" />
          <div>
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {/* Color pickers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand/Primary Color */}
          <div className="space-y-2">
            <Label>{t('primaryColor')}</Label>
            <p className="text-xs text-muted-foreground">{t('primaryColorDescription')}</p>
            <ColorPicker color={brandColor} onChange={handleBrandColorChange} disabled={isSaving} />
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>{t('accentColor')}</Label>
            <p className="text-xs text-muted-foreground">{t('accentColorDescription')}</p>
            <ColorPicker
              color={accentColor}
              onChange={handleAccentColorChange}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Actions */}
        {hasChanges && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground italic">{t('previewNote')}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="h-4 w-4 mr-1" />
                {t('reset')}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Check className="h-4 w-4 mr-1" />
                {isSaving ? t('saving') : t('save')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

function ColorPicker({ color, onChange, disabled }: ColorPickerProps) {
  return (
    <Popover>
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
        <div className="mt-3">
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                  onChange(value);
                }
              }
            }}
            className="w-full px-2 py-1 text-sm font-mono border rounded"
            placeholder="#000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
