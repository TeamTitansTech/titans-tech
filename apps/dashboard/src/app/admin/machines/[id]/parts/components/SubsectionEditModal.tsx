'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SubsectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    subsectionId: string;
    name: string;
    figureReference?: string;
    description?: string;
  }) => Promise<boolean>;
  title: string;
  initialData?: {
    subsectionId: string;
    name: string;
    figureReference?: string;
    description?: string;
  };
  isEdit?: boolean;
}

export function SubsectionEditModal({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
  isEdit = false,
}: SubsectionEditModalProps) {
  const t = useTranslations('machines.partsConfig');

  const [subsectionId, setSubsectionId] = useState(initialData?.subsectionId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [figureReference, setFigureReference] = useState(initialData?.figureReference || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const success = await onSave({
        subsectionId: subsectionId || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        figureReference: figureReference || undefined,
        description: description || undefined,
      });

      if (success) {
        onClose();
        // Reset form
        if (!isEdit) {
          setSubsectionId('');
          setName('');
          setFigureReference('');
          setDescription('');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {isEdit ? t('editSubsectionDescription') : t('createSubsectionDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('subsectionName')} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('subsectionNamePlaceholder')}
                required
              />
            </div>

            {!isEdit && (
              <div className="grid gap-2">
                <Label htmlFor="subsectionId">{t('subsectionId')}</Label>
                <Input
                  id="subsectionId"
                  value={subsectionId}
                  onChange={(e) => setSubsectionId(e.target.value)}
                  placeholder={t('subsectionIdPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('subsectionIdHint')}</p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="figureReference">{t('figureReference')}</Label>
              <Input
                id="figureReference"
                value={figureReference}
                onChange={(e) => setFigureReference(e.target.value)}
                placeholder={t('figureReferencePlaceholder')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!name || saving}>
              {saving ? t('saving') : isEdit ? t('save') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
