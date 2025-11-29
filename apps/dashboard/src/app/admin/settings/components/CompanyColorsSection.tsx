'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HexColorPicker } from 'react-colorful';
import { Palette, Check, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateCompany, type Company } from '@/data/services/companies.api';
import { toast } from 'sonner';

interface CompanyColorsSectionProps {
  companies: Company[];
  isLoading: boolean;
}

const DEFAULT_BRAND_COLOR = '#1e3a5f';
const DEFAULT_ACCENT_COLOR = '#f97415';

export function CompanyColorsSection({ companies, isLoading }: CompanyColorsSectionProps) {
  const t = useTranslations('adminSettings.companyColors');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Color states
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [originalBrandColor, setOriginalBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [originalAccentColor, setOriginalAccentColor] = useState(DEFAULT_ACCENT_COLOR);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
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
    if (!selectedCompanyId) return;

    setIsSaving(true);
    try {
      const response = await updateCompany({
        companyId: selectedCompanyId,
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

        {/* Company selector */}
        <div className="space-y-2">
          <Label htmlFor="company-color-select">{t('selectCompany')}</Label>
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
            disabled={isLoading}
          >
            <SelectTrigger id="company-color-select">
              <SelectValue placeholder={t('selectCompanyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2">
                    {company.brandColor && (
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: company.brandColor }}
                      />
                    )}
                    {company.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompanyId && (
          <>
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
          </>
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
