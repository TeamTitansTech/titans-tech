'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { ArrowLeft, Eye, Settings, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfigTab } from './ConfigTab';
import { ViewTab } from './ViewTab';
import { DeleteProductionLineDialog } from './DeleteProductionLineDialog';
import type { ProductionLine } from '@/data/types/production-lines.types';
import { updateProductionLine } from '@/data/services/production-lines.api';

interface ProductionLineDetailProps {
  productionLine: ProductionLine;
  initialTab?: string;
  canViewMachineDetails?: boolean;
  canEditProductionLine?: boolean;
  canDeleteProductionLine?: boolean;
  canEditCanvas?: boolean;
}

export function ProductionLineDetail({
  productionLine: initialProductionLine,
  initialTab = 'view',
  canViewMachineDetails = true,
  canEditProductionLine = false,
  canDeleteProductionLine = false,
  canEditCanvas = false,
}: ProductionLineDetailProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [productionLine, setProductionLine] = useState(initialProductionLine);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(initialProductionLine.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const t = useTranslations('productionLines');
  const router = useInternalRouter();

  const handleConfigSaved = (updatedLine: ProductionLine) => {
    setProductionLine(updatedLine);
    setActiveTab('view');
    router.refresh();
  };

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();

    if (trimmedName.length === 0) {
      toast.error(t('nameRequired'));
      return;
    }

    if (trimmedName === productionLine.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const result = await updateProductionLine(productionLine.id, { name: trimmedName });

      if (result.errors) {
        toast.error(t('errorSavingName'));
        return;
      }

      if (result.data) {
        toast.success(t('nameSaved'));
        setProductionLine(result.data);
        setIsEditingName(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(t('errorSavingName'));
      console.error(error);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(productionLine.name);
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-6">
        <button onClick={() => router.push('/production-lines')} className="shrink-0">
          <ArrowLeft className="w-5 h-5 hover:text-[hsl(var(--accent))] transition-colors cursor-pointer" />
        </button>
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                disabled={isSavingName}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="text-2xl font-bold h-auto py-1"
                placeholder={t('namePlaceholder')}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveName}
                disabled={isSavingName || editedName.trim().length === 0}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSavingName}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Typography variant="h2">{productionLine.name}</Typography>
              {canEditProductionLine && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">{t('editName')}</span>
                </Button>
              )}
            </div>
          )}
          <Typography variant="muted" className="mt-1">
            {t('pageDescription')}
          </Typography>
        </div>
        {canDeleteProductionLine && (
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deleteButton')}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">
            <Eye className="w-4 h-4 mr-2" />
            {t('tabView')}
          </TabsTrigger>
          {canEditProductionLine && (
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              {t('tabConfig')}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <ViewTab
            productionLine={productionLine}
            canViewMachineDetails={canViewMachineDetails}
            canEditCanvas={canEditCanvas}
          />
        </TabsContent>

        {canEditProductionLine && (
          <TabsContent value="config" className="mt-6">
            <ConfigTab productionLine={productionLine} onSuccess={handleConfigSaved} />
          </TabsContent>
        )}
      </Tabs>

      <DeleteProductionLineDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productionLine={productionLine}
      />
    </div>
  );
}
