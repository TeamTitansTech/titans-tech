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
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SERVICE_SECTION_SLUGS } from '@titans-tech/db/client';
import { BearingClearanceThresholds } from '@/components/alerts/BearingClearanceThresholds';
import { ClutchThresholds } from '@/components/alerts/ClutchThresholds';
import { ClutchCevolaniThresholds } from '@/components/alerts/ClutchCevolaniThresholds';
import { SlideThresholds } from '@/components/alerts/SlideThresholds';
import { GibsThresholds } from '@/components/alerts/GibsThresholds';
import { PistonsThresholds } from '@/components/alerts/PistonsThresholds';
import { TrammingThresholds } from '@/components/alerts/TrammingThresholds';
import { type BlueprintCreationModalProps } from './types';
import { useBlueprintForm } from './hooks/useBlueprintForm';
import { useFieldsManager } from './hooks/useFieldsManager';
import { useEnumOptionsManager } from './hooks/useEnumOptionsManager';
import { BasicInfoSection } from './form-sections/BasicInfoSection';
import { SectionsSelector } from './form-sections/SectionsSelector';
import { CustomFieldsList } from './form-sections/CustomFieldsList';
import { ErrorDisplay } from './form-sections/ErrorDisplay';
import { FormActions } from './form-sections/FormActions';
import { ImageUpload } from '@/components/ui/image-upload';
import { UnitSelector } from '@/components/ui/forms/UnitSelector';
import { UnitManagerProvider } from '@/contexts/UnitManagerContext';

const AVAILABLE_SECTIONS = SERVICE_SECTION_SLUGS;

export const BlueprintCreationModal = ({
  isOpen,
  onClose,
  onSuccess,
  blueprint,
}: BlueprintCreationModalProps) => {
  const t = useTranslations('models');
  const tSections = useTranslations('sections');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const isEditing = !!blueprint;

  const {
    name,
    setName,
    imageUrl,
    setImageUrl,
    selectedSections,
    toggleSection,
    thresholdsOpen,
    setThresholdsOpen,
    thresholds,
    setThresholds,
    bearingClearanceSingleHammerThresholdsOpen,
    setBearingClearanceSingleHammerThresholdsOpen,
    bearingClearanceSingleHammerThresholds,
    setBearingClearanceSingleHammerThresholds,
    clutchThresholdsOpen,
    setClutchThresholdsOpen,
    clutchThresholds,
    setClutchThresholds,
    clutchCevolaniThresholdsOpen,
    setClutchCevolaniThresholdsOpen,
    clutchCevolaniThresholds,
    setClutchCevolaniThresholds,
    slideSingleHammerThresholdsOpen,
    setSlideSingleHammerThresholdsOpen,
    slideSingleHammerThresholds,
    setSlideSingleHammerThresholds,
    slideDoubleHammerThresholdsOpen,
    setSlideDoubleHammerThresholdsOpen,
    slideDoubleHammerThresholds,
    setSlideDoubleHammerThresholds,
    gibsThresholdsOpen,
    setGibsThresholdsOpen,
    gibsThresholds,
    setGibsThresholds,
    pistonsThresholdsOpen,
    setPistonsThresholdsOpen,
    pistonsThresholds,
    setPistonsThresholds,
    trammingThresholdsOpen,
    setTrammingThresholdsOpen,
    trammingThresholds,
    setTrammingThresholds,
    handleSubmit,
    isLoading,
    result,
    reset: resetForm,
    hasUnsavedChanges,
  } = useBlueprintForm(onSuccess, onClose, blueprint?.id);

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

  // Initialize form with blueprint data when editing
  useEffect(() => {
    if (isOpen && blueprint) {
      setName(blueprint.name);
      setImageUrl(blueprint.imageUrl || null);

      // Initialize fields
      initializeFields(blueprint.fields);

      // Convert enum sections to slugs and set selected sections
      const sectionSlugs = blueprint.sections.map((section) => section.toLowerCase());
      sectionSlugs.forEach((slug) => {
        if (!selectedSections.includes(slug)) {
          toggleSection(slug);
        }
      });
    }
  }, [isOpen, blueprint]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <UnitManagerProvider>
          <DialogContent className="flex max-w-4xl flex-col bg-background p-0">
            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <DialogHeader className="shrink-0 border-b border-border p-6 pb-4">
                <DialogTitle className="text-2xl text-foreground">
                  {isEditing ? t('editTitle') : t('title')}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing ? t('editDescription') : t('description')}
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <BasicInfoSection
                  name={name}
                  setName={setName}
                  translations={{
                    title: t('form.basicInfo.title'),
                    nameLabel: t('form.name.label'),
                    namePlaceholder: t('form.name.placeholder'),
                  }}
                />

                <div className="space-y-2">
                  <Label htmlFor="image">{t('form.image.label')}</Label>
                  <ImageUpload
                    value={imageUrl || undefined}
                    onChange={setImageUrl}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">{t('form.image.description')}</p>
                </div>

                <Separator />

                <SectionsSelector
                  selectedSections={selectedSections}
                  availableSections={AVAILABLE_SECTIONS}
                  toggleSection={toggleSection}
                  disabled={isEditing}
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
                  headerExtra={
                    selectedSections.includes('bearing_clearance') ||
                    selectedSections.includes('bearing_clearance_single_hammer') ||
                    selectedSections.includes('clutch') ||
                    selectedSections.includes('clutch_cevolani') ||
                    selectedSections.includes('slide_single_hammer') ||
                    selectedSections.includes('slide_double_hammer') ||
                    selectedSections.includes('gibs') ||
                    selectedSections.includes('pistons') ||
                    selectedSections.includes('tramming') ? (
                      <UnitSelector />
                    ) : undefined
                  }
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

                {!isEditing && selectedSections.includes('bearing_clearance') && (
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

                {!isEditing && selectedSections.includes('bearing_clearance_single_hammer') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <BearingClearanceThresholds
                        open={bearingClearanceSingleHammerThresholdsOpen}
                        onOpenChange={setBearingClearanceSingleHammerThresholdsOpen}
                        data={bearingClearanceSingleHammerThresholds}
                        onChange={setBearingClearanceSingleHammerThresholds}
                        title={`${tSections('bearing_clearance_single_hammer')} - Thresholds`}
                      />
                    </section>
                  </>
                )}

                {!isEditing && selectedSections.includes('clutch') && (
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

                {!isEditing && selectedSections.includes('clutch_cevolani') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <ClutchCevolaniThresholds
                        open={clutchCevolaniThresholdsOpen}
                        onOpenChange={setClutchCevolaniThresholdsOpen}
                        data={clutchCevolaniThresholds}
                        onChange={setClutchCevolaniThresholds}
                      />
                    </section>
                  </>
                )}

                {!isEditing && selectedSections.includes('slide_single_hammer') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <SlideThresholds
                        open={slideSingleHammerThresholdsOpen}
                        onOpenChange={setSlideSingleHammerThresholdsOpen}
                        data={slideSingleHammerThresholds}
                        onChange={setSlideSingleHammerThresholds}
                      />
                    </section>
                  </>
                )}

                {!isEditing && selectedSections.includes('slide_double_hammer') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <SlideThresholds
                        open={slideDoubleHammerThresholdsOpen}
                        onOpenChange={setSlideDoubleHammerThresholdsOpen}
                        data={slideDoubleHammerThresholds}
                        onChange={setSlideDoubleHammerThresholds}
                      />
                    </section>
                  </>
                )}

                {!isEditing && selectedSections.includes('gibs') && (
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

                {!isEditing && selectedSections.includes('pistons') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <PistonsThresholds
                        open={pistonsThresholdsOpen}
                        onOpenChange={setPistonsThresholdsOpen}
                        data={pistonsThresholds}
                        onChange={setPistonsThresholds}
                      />
                    </section>
                  </>
                )}

                {!isEditing && selectedSections.includes('tramming') && (
                  <>
                    <Separator />
                    <section className="space-y-4">
                      <TrammingThresholds
                        open={trammingThresholdsOpen}
                        onOpenChange={setTrammingThresholdsOpen}
                        data={trammingThresholds}
                        onChange={setTrammingThresholds}
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
                  submitIdle: isEditing ? t('form.submit.edit') : t('form.submit.idle'),
                }}
              />
            </form>
          </DialogContent>
        </UnitManagerProvider>
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
