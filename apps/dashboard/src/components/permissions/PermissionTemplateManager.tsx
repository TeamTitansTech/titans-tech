'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Permissions } from '@titans-tech/shared/types';
import type { PermissionTemplateResponseDto } from '@titans-tech/shared/backend-dtos';
import {
  getPermissionTemplates,
  createPermissionTemplate,
  updatePermissionTemplate,
  deletePermissionTemplate,
} from '@/data/services/permission-templates.api';
import { PermissionsEditor } from './PermissionsEditor';

interface PermissionTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentPermissions: Permissions;
  onApplyTemplate: (permissions: Permissions) => void;
}

export function PermissionTemplateManager({
  open,
  onOpenChange,
  companyId,
  currentPermissions,
  onApplyTemplate,
}: PermissionTemplateManagerProps) {
  const t = useTranslations('settings.permissionTemplates');
  const [templates, setTemplates] = useState<PermissionTemplateResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [templatePermissions, setTemplatePermissions] = useState<Permissions>(currentPermissions);

  // Load templates when dialog opens
  useEffect(() => {
    if (open && companyId) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyId]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getPermissionTemplates(companyId);
      if (response.data) {
        setTemplates(response.data);
      } else if (response.errors) {
        toast.error(t('errorLoading'));
      }
    } catch {
      toast.error(t('errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPermissionTemplate(companyId, {
        name: formData.name,
        description: formData.description || undefined,
        permissions: templatePermissions,
      });

      if (response.data) {
        toast.success(t('created'));
        setTemplates([response.data, ...templates]);
        setShowCreateForm(false);
        setFormData({ name: '', description: '' });
        setTemplatePermissions(currentPermissions); // Reset to current permissions
      } else {
        toast.error(t('errorCreating'));
      }
    } catch {
      toast.error(t('errorCreating'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await updatePermissionTemplate(companyId, id, {
        name: formData.name,
        description: formData.description || undefined,
        permissions: templatePermissions,
      });

      if (response.data) {
        toast.success(t('updated'));
        setTemplates(templates.map((t) => (t.id === id ? response.data! : t)));
        setEditingId(null);
        setFormData({ name: '', description: '' });
        setTemplatePermissions(currentPermissions); // Reset to current permissions
      } else {
        toast.error(t('errorUpdating'));
      }
    } catch {
      toast.error(t('errorUpdating'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await deletePermissionTemplate(companyId, id);
      if (!response.errors) {
        toast.success(t('deleted'));
        setTemplates(templates.filter((t) => t.id !== id));
      } else {
        toast.error(t('errorDeleting'));
      }
    } catch {
      toast.error(t('errorDeleting'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (template: PermissionTemplateResponseDto) => {
    onApplyTemplate(template.permissions);
    toast.success(t('applied', { name: template.name }));
    onOpenChange(false);
  };

  const startEdit = (template: PermissionTemplateResponseDto) => {
    setEditingId(template.id);
    setFormData({ name: template.name, description: template.description || '' });
    setTemplatePermissions(template.permissions);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setTemplatePermissions(currentPermissions);
  };

  const startCreate = () => {
    setShowCreateForm(true);
    setTemplatePermissions(currentPermissions); // Initialize with current permissions
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create Form */}
          {showCreateForm && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">{t('form.name')}</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">{t('form.description')}</Label>
                <Textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('form.descriptionPlaceholder')}
                  disabled={isLoading}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('form.permissions') || 'Permissões'}</Label>
                <PermissionsEditor
                  permissions={templatePermissions}
                  onChange={setTemplatePermissions}
                  disabled={isLoading}
                  showPresetSelector={false}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', description: '' });
                  }}
                  disabled={isLoading}
                >
                  {t('form.cancel')}
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={isLoading}>
                  {t('form.save')}
                </Button>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="h-[300px] overflow-y-auto pr-4">
            {isLoading && templates.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t('loading')}</p>
            ) : templates.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t('noTemplates')}</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border p-3 transition-colors hover:border-primary/50"
                  >
                    {editingId === template.id ? (
                      <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={isLoading}
                        />
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          disabled={isLoading}
                          rows={2}
                        />
                        <div className="space-y-2">
                          <Label className="text-sm">{t('form.permissions') || 'Permissões'}</Label>
                          <PermissionsEditor
                            permissions={templatePermissions}
                            onChange={setTemplatePermissions}
                            disabled={isLoading}
                            showPresetSelector={false}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            disabled={isLoading}
                          >
                            <X className="mr-1 h-4 w-4" />
                            {t('form.cancel')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(template.id)}
                            disabled={isLoading}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            {t('form.save')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold">{template.name}</h4>
                            {template.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {template.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {Object.values(template.permissions).filter((v) => v === true).length}{' '}
                              {t('permissionsCount')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(template)}
                              disabled={isLoading}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(template.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => handleApply(template)}
                          disabled={isLoading}
                        >
                          {t('apply')}
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Create New Template Button */}
          {!showCreateForm && !editingId && (
            <Button onClick={startCreate} variant="outline" className="w-full" disabled={isLoading}>
              {t('createNew')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
