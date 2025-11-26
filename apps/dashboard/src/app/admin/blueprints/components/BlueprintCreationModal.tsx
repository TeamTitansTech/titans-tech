'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SERVICE_SECTION_SLUGS } from '@titans-tech/db/client';
import { BearingClearanceThresholds } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholds } from '@/components/alerts/ClutchThresholds';
import { SlideThresholds } from '@/components/alerts/SlideThresholds';
import { type BlueprintCreationModalProps } from './types';
import { useBlueprintForm } from './hooks/useBlueprintForm';
import { useFieldsManager } from './hooks/useFieldsManager';
import { useEnumOptionsManager } from './hooks/useEnumOptionsManager';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { SectionsSelector } from './form-sections/SectionsSelector';
import { CustomFieldsList } from './form-sections/CustomFieldsList';
import { ErrorDisplay } from './form-sections/ErrorDisplay';
import { FormActions } from './form-sections/FormActions';

const AVAILABLE_SECTIONS = SERVICE_SECTION_SLUGS;

export const BlueprintCreationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: BlueprintCreationModalProps) => {
  const t = useTranslations('models');
  const tSections = useTranslations('sections');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    name,
    setName,
    selectedSections,
    toggleSection,
    thresholdsOpen,
    setThresholdsOpen,
    thresholds,
    setThresholds,
    clutchThresholdsOpen,
    setClutchThresholdsOpen,
    clutchThresholds,
    setClutchThresholds,
    slideThresholdsOpen,
    setSlideThresholdsOpen,
    slideThresholds,
    setSlideThresholds,
    handleSubmit,
    isLoading,
    result,
    reset: resetForm,
    hasUnsavedChanges,
  } = useBlueprintForm(onSuccess, onClose);

  const {
    fields,
    addField,
    removeField,
    updateField,
    hasInvalidEnumFields,
    reset: resetFields,
  } = useFieldsManager();

  const {
    newOptionValues,
    addOption,
    removeOption,
    updateNewOptionValue,
    reset: resetEnumOptions,
  } = useEnumOptionsManager();

  // Reset all form fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      resetFields();
      resetEnumOptions();
    }
  }, [isOpen, resetForm, resetFields, resetEnumOptions]);

  const handleClose = () => {
    if (hasUnsavedChanges(fields)) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, fields, resetFields, resetEnumOptions);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-background">
          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
            <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
              <DialogTitle className="text-2xl text-foreground">{t('title')}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('description')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
              <BasicInfoSection
                name={name}
                setName={setName}
                translations={{
                  title: t('form.basicInfo.title'),
                  nameLabel: t('form.name.label'),
                  namePlaceholder: t('form.name.placeholder'),
                }}
              />

              <Separator />

              <SectionsSelector
                selectedSections={selectedSections}
                availableSections={AVAILABLE_SECTIONS}
                toggleSection={toggleSection}
                translations={{
                  title: t('form.sections.label'),
                  getSectionName: (section: string) => tSections(section),
                }}
              />

              <Separator />

              <CustomFieldsList
                fields={fields}
                addField={addField}
                removeField={removeField}
                updateField={updateField}
                newOptionValues={newOptionValues}
                addOption={addOption}
                removeOption={removeOption}
                updateNewOptionValue={updateNewOptionValue}
                translations={{
                  title: t('form.fields.label'),
                  addButton: t('form.fields.addButton'),
                  fieldNumber: t('form.fields.fieldNumber', { number: 0 }).replace(' 0', ''),
                  fieldNameLabel: t('form.fields.fieldName.label'),
                  fieldNamePlaceholder: t('form.fields.fieldName.placeholder'),
                  fieldTypeLabel: t('form.fields.fieldType.label'),
                  fieldTypeString: t('form.fields.fieldType.string'),
                  fieldTypeInt: t('form.fields.fieldType.int'),
                  fieldTypeEnum: t('form.fields.fieldType.enum'),
                  fieldOptionsLabel: t('form.fields.fieldOptions.label'),
                  fieldOptionsPlaceholder: t('form.fields.fieldOptions.placeholder'),
                  fieldOptionsRequired: t('form.fields.fieldOptions.required'),
                  fieldOptionsAddButton: t('form.fields.addButton'),
                }}
              />

              {selectedSections.includes('bearing_clearance') && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    <BearingClearanceThresholds
                      open={thresholdsOpen}
                      onOpenChange={setThresholdsOpen}
                      data={thresholds}
                      onChange={setThresholds}
                    />
                  </section>
                </>
              )}

              {selectedSections.includes('clutch') && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    <ClutchThresholds
                      open={clutchThresholdsOpen}
                      onOpenChange={setClutchThresholdsOpen}
                      data={clutchThresholds}
                      onChange={setClutchThresholds}
                    />
                  </section>
                </>
              )}

              {selectedSections.includes('slide') && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    <SlideThresholds
                      open={slideThresholdsOpen}
                      onOpenChange={setSlideThresholdsOpen}
                      data={slideThresholds}
                      onChange={setSlideThresholds}
                    />
                  </section>
                </>
              )}

              <ErrorDisplay
                errors={result?.errors ?? undefined}
                translations={{
                  title: t('form.error.title'),
                }}
              />
            </div>

            <FormActions
              onCancel={handleClose}
              isLoading={isLoading}
              isDisabled={hasInvalidEnumFields}
              translations={{
                cancel: t('form.cancel'),
                submitLoading: t('form.submit.loading'),
                submitIdle: t('form.submit.idle'),
              }}
            />
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmClose}
        title={t('form.confirmClose.title')}
        description={t('form.confirmClose.description')}
        confirmText={t('form.confirmClose.confirm')}
        cancelText={t('form.confirmClose.cancel')}
      />
    </>
  );
};
