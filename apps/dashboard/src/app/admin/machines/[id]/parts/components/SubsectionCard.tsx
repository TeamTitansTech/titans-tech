'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Edit, Trash2, List, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import type { SubsectionResponseDto } from '@titans-tech/shared/backend-dtos';
import Image from 'next/image';
import { toast } from 'sonner';
import { uploadSubsectionDiagram } from '@/data/services/machine-parts.api';

interface SubsectionCardProps {
  machineId: string;
  subsection: SubsectionResponseDto;
  onEdit: () => void;
  onEditParts: () => void;
  onDelete: () => void;
  onImageUploaded: (updatedSubsection: SubsectionResponseDto) => void;
}

export function SubsectionCard({
  machineId,
  subsection,
  onEdit,
  onEditParts,
  onDelete,
  onImageUploaded,
}: SubsectionCardProps) {
  const partsCount = subsection.parts.length;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadSubsectionDiagram(machineId, subsection.id, formData);
      if (response.errors) {
        toast.error(response.errors.join(', '));
      } else if (response.data) {
        toast.success('Diagram uploaded successfully');
        onImageUploaded(response.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload diagram');
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{subsection.name}</CardTitle>
            {subsection.figureReference && (
              <Typography variant="small" className="text-muted-foreground">
                {subsection.figureReference}
              </Typography>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              title="Edit subsection"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onDelete}
              title="Delete subsection"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {subsection.description && (
          <Typography variant="small" className="text-muted-foreground line-clamp-2 mb-3">
            {subsection.description}
          </Typography>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-4 mb-3">
          <button
            type="button"
            onClick={handleImageClick}
            disabled={uploading}
            className="relative w-16 h-16 rounded border bg-muted overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-colors group"
            title="Click to upload diagram"
          >
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subsection.diagramImageUrl ? (
              <>
                <Image
                  src={subsection.diagramImageUrl}
                  alt={subsection.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
                <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:hidden" />
                <Upload className="h-5 w-5 text-muted-foreground hidden group-hover:block" />
              </div>
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <List className="h-4 w-4" />
              <span>
                {partsCount} {partsCount === 1 ? 'part' : 'parts'}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onEditParts}>
          <List className="h-4 w-4 mr-2" />
          Edit Parts List
        </Button>
      </CardContent>
    </Card>
  );
}
