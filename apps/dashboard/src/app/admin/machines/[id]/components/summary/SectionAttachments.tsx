'use client';

import { useTranslations } from 'next-intl';
import { FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';
import type { Attachment } from '@/data/types/services.types';

interface SectionAttachmentsProps {
  attachments?: Attachment[];
}

export function SectionAttachments({ attachments }: SectionAttachmentsProps) {
  const t = useTranslations('services.modal.summary');

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-2 mt-3">
      <div className="font-semibold text-muted-foreground mb-2 text-sm">
        {t('sectionAttachments')}
      </div>
      <div className="space-y-1.5">
        {attachments.map((attachment, index) => {
          const isCSV = attachment.name.toLowerCase().endsWith('.csv');
          return (
            <a
              key={`${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors group"
            >
              {isCSV ? (
                <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate flex-1">{attachment.name}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
