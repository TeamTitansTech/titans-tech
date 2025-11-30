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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { SERVICE_SECTION_SLUGS } from '@titans-tech/db/client';
import { BearingClearanceThresholds } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholds } from '@/components/alerts/ClutchThresholds';
import { SlideThresholds } from '@/components/alerts/SlideThresholds';
import { GibsThresholds } from '@/components/alerts/GibsThresholds';
import { getBlueprint } from '@/data/services/blueprints.api';
import { useBlueprintEditForm } from './hooks/useBlueprintEditForm';
import { useFieldsManager } from './hooks/useFieldsManager';
import { useEnumOptionsManager } from './hooks/useEnumOptionsManager';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { SectionsSelector } from './form-sections/SectionsSelector';
import { CustomFieldsList } from './form-sections/CustomFieldsList';
import { ErrorDisplay } from './form-sections/ErrorDisplay';
import { FormActions } from './form-sections/FormActions';

const AVAILABLE_SECTIONS = SERVICE_SECTION_SLUGS;

interface BlueprintEditModalProps {
  isOpen: boolean;
  blueprintId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BlueprintEditModal = ({
  isOpen,
  blueprintId,
  onClose,
  onSuccess,
}: BlueprintEditModalProps) => {
  const t = useTranslations('models');
  const tSections = useTranslations('sections');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoadingBlueprint, setIsLoadingBlueprint] = useState(false);
  const [hasMachines, setHasMachines] = useState(false);

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
    gibsThresholdsOpen,
    setGibsThresholdsOpen,
    gibsThresholds,
    setGibsThresholds,
    handleSubmit,
    isLoading,
    result,
    reset: resetForm,
    hasUnsavedChanges,
    initializeForm,
  } = useBlueprintEditForm(blueprintId, hasMachines, onSuccess, onClose);

  const {
    fields,
    addField,
    removeField,
    updateField,
    hasInvalidEnumFields,
    reset: resetFields,
    initializeFields,
  } = useFieldsManager();

  const {
    newOptionValues,
    addOption,
    removeOption,
    updateNewOptionValue,
    reset: resetEnumOptions,
  } = useEnumOptionsManager();

  // Fetch blueprint data when modal opens
  useEffect(() => {
    const fetchBlueprintData = async () => {
      if (isOpen && blueprintId) {
        setIsLoadingBlueprint(true);
        try {
          const response = await getBlueprint(blueprintId);
          if (response.data) {
            const blueprint = response.data;

            // Check if blueprint has machines
            const machineCount = blueprint._count?.machines ?? 0;
            setHasMachines(machineCount > 0);

            // Initialize form with blueprint data
            initializeForm(blueprint);

            // Initialize fields
            if (blueprint.fields && Array.isArray(blueprint.fields)) {
              // Convert BlueprintField[] to Field[] with proper typing
              const typedFields = blueprint.fields.map((field) => ({
                fieldName: field.fieldName,
                fieldSlug: field.fieldSlug,
                fieldType: field.fieldType as 'string' | 'int' | 'enum',
                fieldOptions: field.fieldOptions,
              }));
              initializeFields(typedFields);
            }
          }
        } catch (error) {
          console.error('Failed to fetch blueprint:', error);
        } finally {
          setIsLoadingBlueprint(false);
        }
      }
    };

    fetchBlueprintData();
  }, [isOpen, blueprintId, initializeForm, initializeFields]);

  // Reset all form fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      resetFields();
      resetEnumOptions();
      setHasMachines(false);
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
    await handleSubmit(e, fields, hasMachines, resetFields, resetEnumOptions);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-background">
          {isLoadingBlueprint ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
              <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border">
                <DialogTitle className="text-2xl text-foreground">{t('editTitle')}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {t('editDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
                {hasMachines && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{t('form.hasMachinesWarning')}</AlertDescription>
                  </Alert>
                )}

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
                  disabled={hasMachines}
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
                  disabled={hasMachines}
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

                {selectedSections.includes('gibs') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <GibsThresholds
                        open={gibsThresholdsOpen}
                        onOpenChange={setGibsThresholdsOpen}
                        data={gibsThresholds}
                        onChange={setGibsThresholds}
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
                  submitLoading: t('form.submit.updating'),
                  submitIdle: t('form.submit.update'),
                }}
              />
            </form>
          )}
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
