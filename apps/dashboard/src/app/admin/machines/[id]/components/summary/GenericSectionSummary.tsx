'use client';

import { formatFieldName, displayValue } from '../utils/fieldFormatters';
import { isIdField } from '../utils/sectionDataUtils';

interface GenericSectionSummaryProps {
  data: Record<string, unknown>;
  sectionKey?: string;
}

export function GenericSectionSummary({ data }: GenericSectionSummaryProps) {
  if (!data) return <div className="text-sm text-muted-foreground">No data available</div>;

  // Function to recursively render data
  const renderData = (obj: Record<string, unknown>, depth = 0): React.ReactElement[] => {
    if (!obj || typeof obj !== 'object') return [];

    const elements: React.ReactElement[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      // Skip ID fields and empty values
      if (isIdField(key) || value === null || value === undefined || value === '') {
        return;
      }

      // Handle nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        elements.push(
          <div key={key} className="mt-3">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {formatFieldName(key)}
            </div>
            <div className="pl-3 border-l-2 border-muted space-y-1.5">
              {renderData(value, depth + 1)}
            </div>
          </div>,
        );
        return;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) return;

        elements.push(
          <div key={key} className="mt-3">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {formatFieldName(key)}
            </div>
            <div className="pl-3 space-y-2">
              {value.map((item, index) => (
                <div key={index} className="border rounded-md p-2 bg-muted/20">
                  {typeof item === 'object' ? (
                    <div className="space-y-1.5 text-[11px]">{renderData(item, depth + 1)}</div>
                  ) : (
                    <div className="text-sm">{displayValue(item)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>,
        );
        return;
      }

      // Handle regular fields
      elements.push(
        <div key={key} className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{formatFieldName(key)}:</span>
          <span className="font-medium text-right">{displayValue(value)}</span>
        </div>,
      );
    });

    return elements;
  };

  return (
    <div className="space-y-2">
      {renderData(data)}
      {Object.keys(data).filter(
        (key) =>
          !isIdField(key) && data[key] !== null && data[key] !== undefined && data[key] !== '',
      ).length === 0 && (
        <div className="text-sm text-muted-foreground italic">No data to display</div>
      )}
    </div>
  );
}
