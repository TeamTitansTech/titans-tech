'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type {
  PartsConfigResponseDto,
  SubsectionResponseDto,
} from '@titans-tech/shared/backend-dtos';
import {
  getMachineSectionParts,
  createSubsection,
  deleteSubsection,
  updateSubsection,
  updateSubsectionParts,
  resetSectionToDefaults,
} from '@/data/services/machine-parts.api';
import { SubsectionCard } from './SubsectionCard';
import { DefaultSubsectionCard } from './DefaultSubsectionCard';
import { SECTION_SUBSECTIONS_MAP, type Subsection } from '@/data/parts/section-subsections';
import { SubsectionEditModal } from './SubsectionEditModal';
import { PartsTableEditor } from './PartsTableEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Sections that support parts customization
const SECTIONS_WITH_PARTS = [
  'BEARING_CLEARANCE',
  'BEARING_CLEARANCE_SINGLE_HAMMER',
  'CLUTCH',
  'CLUTCH_CEVOLANI',
  'COUNTERBALANCE_CYLINDER_AIRBAG',
  'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  'SLIDE_SINGLE_HAMMER',
  'SLIDE_DOUBLE_HAMMER',
  'GIBS',
];

interface PartsConfigEditorProps {
  machineId: string;
  machineName: string;
  blueprintSections: string[];
  initialPartsConfig: PartsConfigResponseDto | null;
}

export function PartsConfigEditor({
  machineId,
  machineName: _machineName,
  blueprintSections,
  initialPartsConfig,
}: PartsConfigEditorProps) {
  const t = useTranslations('machines.partsConfig');
  const tParts = useTranslations('parts');

  // Filter to only show sections that support parts and are in the blueprint
  const availableSections = blueprintSections.filter((section) =>
    SECTIONS_WITH_PARTS.includes(section),
  );

  const [activeSection, setActiveSection] = useState<string>(availableSections[0] || '');
  const [sectionSubsections, setSectionSubsections] = useState<
    Record<string, SubsectionResponseDto[]>
  >(() => {
    // Initialize with data from initial config
    const initial: Record<string, SubsectionResponseDto[]> = {};
    if (initialPartsConfig?.config?.subsections) {
      for (const sub of initialPartsConfig.config.subsections) {
        if (!initial[sub.sectionKey]) {
          initial[sub.sectionKey] = [];
        }
        initial[sub.sectionKey].push(sub);
      }
    }
    return initial;
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [editingSubsection, setEditingSubsection] = useState<SubsectionResponseDto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingParts, setEditingParts] = useState<SubsectionResponseDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    subsectionId: string;
    name: string;
  } | null>(null);
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);

  const _loadSectionParts = useCallback(
    async (sectionKey: string) => {
      setLoading((prev) => ({ ...prev, [sectionKey]: true }));
      try {
        const response = await getMachineSectionParts(machineId, sectionKey);
        if (response.data) {
          setSectionSubsections((prev) => ({
            ...prev,
            [sectionKey]: response.data!.subsections,
          }));
        }
      } catch (error) {
        console.error('Failed to load section parts:', error);
      } finally {
        setLoading((prev) => ({ ...prev, [sectionKey]: false }));
      }
    },
    [machineId],
  );

  const handleCreateSubsection = async (data: {
    subsectionId: string;
    name: string;
    figureReference?: string;
    description?: string;
  }) => {
    const response = await createSubsection(machineId, activeSection, data);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return false;
    }
    if (response.data) {
      setSectionSubsections((prev) => ({
        ...prev,
        [activeSection]: [...(prev[activeSection] || []), response.data!],
      }));
      toast.success(t('subsectionCreated'));
      return true;
    }
    return false;
  };

  const handleUpdateSubsection = async (
    subsectionId: string,
    data: {
      name?: string;
      figureReference?: string | null;
      description?: string | null;
    },
  ) => {
    const response = await updateSubsection(machineId, subsectionId, data);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return false;
    }
    if (response.data) {
      setSectionSubsections((prev) => ({
        ...prev,
        [activeSection]: (prev[activeSection] || []).map((s) =>
          s.id === subsectionId ? response.data! : s,
        ),
      }));
      toast.success(t('subsectionUpdated'));
      return true;
    }
    return false;
  };

  const handleDeleteSubsection = async (subsectionId: string) => {
    const response = await deleteSubsection(machineId, subsectionId);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return;
    }
    setSectionSubsections((prev) => ({
      ...prev,
      [activeSection]: (prev[activeSection] || []).filter((s) => s.id !== subsectionId),
    }));
    toast.success(t('subsectionDeleted'));
    setDeleteConfirm(null);
  };

  const handleUpdateParts = async (
    subsectionId: string,
    parts: Array<{
      partNumber: string;
      description: string;
      quantity: string;
      unit: string;
      location?: string;
      notes?: string;
    }>,
  ) => {
    const response = await updateSubsectionParts(machineId, subsectionId, parts);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return false;
    }
    if (response.data) {
      setSectionSubsections((prev) => ({
        ...prev,
        [activeSection]: (prev[activeSection] || []).map((s) =>
          s.id === subsectionId ? response.data! : s,
        ),
      }));
      // Update editingParts to reflect the new data
      setEditingParts(response.data);
      toast.success(t('partsUpdated'));
      return true;
    }
    return false;
  };

  const handleResetSection = async (sectionKey: string) => {
    const response = await resetSectionToDefaults(machineId, sectionKey);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return;
    }
    setSectionSubsections((prev) => ({
      ...prev,
      [sectionKey]: [],
    }));
    toast.success(t('sectionReset'));
    setResetConfirm(null);
  };

  const handleImageUploaded = (updatedSubsection: SubsectionResponseDto) => {
    setSectionSubsections((prev) => ({
      ...prev,
      [activeSection]: (prev[activeSection] || []).map((s) =>
        s.id === updatedSubsection.id ? updatedSubsection : s,
      ),
    }));
  };

  const handleCopyDefaultToCustom = async (defaultSubsection: Subsection) => {
    // Get the translated name (or use nameKey if not a translation key)
    const displayName = defaultSubsection.nameKey.startsWith('subsections.')
      ? tParts(defaultSubsection.nameKey)
      : defaultSubsection.nameKey;

    // Create a new custom subsection from the default
    const data = {
      subsectionId: defaultSubsection.id,
      name: displayName,
      figureReference: defaultSubsection.figureReference,
      description: defaultSubsection.description,
      diagramImageUrl: defaultSubsection.diagramImage, // Keep the default diagram image
      parts: defaultSubsection.parts.map((p, idx) => ({
        partNumber: p.partNumber,
        description: p.description,
        quantity: String(p.quantity),
        unit: p.unit,
        location: p.location,
        notes: p.notes,
        displayOrder: idx,
      })),
    };

    const response = await createSubsection(machineId, activeSection, data);
    if (response.errors) {
      toast.error(response.errors.join(', '));
      return;
    }
    if (response.data) {
      setSectionSubsections((prev) => ({
        ...prev,
        [activeSection]: [...(prev[activeSection] || []), response.data!],
      }));
      toast.success(t('defaultCopied'));
    }
  };

  // Get default subsections for current section
  const defaultSubsections = SECTION_SUBSECTIONS_MAP[activeSection] || [];

  const getSectionLabel = (sectionKey: string) => {
    const labels: Record<string, string> = {
      BEARING_CLEARANCE: 'Bearing Clearance',
      BEARING_CLEARANCE_SINGLE_HAMMER: 'Bearing Clearance (Single)',
      CLUTCH: 'Clutch & Brake',
      CLUTCH_CEVOLANI: 'Clutch Cevolani',
      COUNTERBALANCE_CYLINDER_AIRBAG: 'Counterbalance',
      LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'Lubrication',
      SLIDE_SINGLE_HAMMER: 'Slide (Single)',
      SLIDE_DOUBLE_HAMMER: 'Slide (Double)',
      GIBS: 'Gibs',
    };
    return labels[sectionKey] || sectionKey;
  };

  if (availableSections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <Typography variant="p">{t('noPartsSupported')}</Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSubsections = sectionSubsections[activeSection] || [];
  const isLoading = loading[activeSection];

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="flex-wrap h-auto gap-1">
          {availableSections.map((section) => (
            <TabsTrigger key={section} value={section} className="text-sm">
              {getSectionLabel(section)}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSections.map((section) => (
          <TabsContent key={section} value={section} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{getSectionLabel(section)} Parts</CardTitle>
                <div className="flex gap-2">
                  {currentSubsections.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setResetConfirm(section)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('resetToDefaults')}
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addSubsection')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : currentSubsections.length === 0 && defaultSubsections.length === 0 ? (
                  <div className="py-12 text-center">
                    <Settings2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <Typography variant="p" className="text-muted-foreground mb-4">
                      {t('noCustomParts')}
                    </Typography>
                    <Typography variant="small" className="text-muted-foreground">
                      {t('noCustomPartsHint')}
                    </Typography>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Custom Subsections */}
                    {currentSubsections.length > 0 && (
                      <div>
                        <Typography
                          variant="h4"
                          className="mb-3 text-sm font-medium text-muted-foreground"
                        >
                          {t('customSubsections')}
                        </Typography>
                        <div className="grid gap-4 md:grid-cols-2">
                          {currentSubsections.map((subsection) => (
                            <SubsectionCard
                              key={subsection.id}
                              machineId={machineId}
                              subsection={subsection}
                              onEdit={() => setEditingSubsection(subsection)}
                              onEditParts={() => setEditingParts(subsection)}
                              onDelete={() =>
                                setDeleteConfirm({
                                  subsectionId: subsection.id,
                                  name: subsection.name,
                                })
                              }
                              onImageUploaded={handleImageUploaded}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Default Subsections */}
                    {defaultSubsections.length > 0 && (
                      <div>
                        <Typography
                          variant="h4"
                          className="mb-3 text-sm font-medium text-muted-foreground"
                        >
                          {t('defaultSubsections')}
                        </Typography>
                        <div className="grid gap-4 md:grid-cols-2">
                          {defaultSubsections
                            .filter(
                              (def) => !currentSubsections.some((c) => c.subsectionId === def.id),
                            )
                            .map((defaultSub) => (
                              <DefaultSubsectionCard
                                key={defaultSub.id}
                                subsection={defaultSub}
                                onCopyToCustom={() => handleCopyDefaultToCustom(defaultSub)}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Subsection Modal */}
      <SubsectionEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSubsection}
        title={t('createSubsection')}
      />

      {/* Edit Subsection Modal */}
      {editingSubsection && (
        <SubsectionEditModal
          isOpen={!!editingSubsection}
          onClose={() => setEditingSubsection(null)}
          onSave={(data) => handleUpdateSubsection(editingSubsection.id, data)}
          title={t('editSubsection')}
          initialData={{
            subsectionId: editingSubsection.subsectionId,
            name: editingSubsection.name,
            figureReference: editingSubsection.figureReference || undefined,
            description: editingSubsection.description || undefined,
          }}
          isEdit
        />
      )}

      {/* Edit Parts Modal */}
      {editingParts && (
        <PartsTableEditor
          isOpen={!!editingParts}
          onClose={() => setEditingParts(null)}
          subsection={editingParts}
          onSave={(parts) => handleUpdateParts(editingParts.id, parts)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteSubsectionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteSubsectionDescription', { name: deleteConfirm?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteSubsection(deleteConfirm.subsectionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={!!resetConfirm} onOpenChange={() => setResetConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resetSectionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('resetSectionDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetConfirm && handleResetSection(resetConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('reset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
