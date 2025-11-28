import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';

interface EnumOptionsManagerProps {
  fieldIndex: number;
  options?: string[];
  newValue: string;
  disabled?: boolean;
  onAdd: () => void;
  onRemove: (optionIndex: number) => void;
  onValueChange: (value: string) => void;
  translations: {
    label: string;
    placeholder: string;
    addButton: string;
    required: string;
  };
}

export const EnumOptionsManager = ({
  fieldIndex: _fieldIndex,
  options,
  newValue,
  disabled = false,
  onAdd,
  onRemove,
  onValueChange,
  translations,
}: EnumOptionsManagerProps) => {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{translations.label}</Label>

      {options && options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="flex items-center gap-1 bg-muted rounded-md px-3 py-1"
            >
              <Typography variant="small">{option}</Typography>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onRemove(optionIndex)}
                className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="text"
          value={newValue}
          disabled={disabled}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={translations.placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={onAdd} disabled={disabled} variant="outline" size="sm">
          {translations.addButton}
        </Button>
      </div>

      {options?.length === 0 && (
        <Typography variant="small" className="text-destructive">
          {translations.required}
        </Typography>
      )}
    </div>
  );
};
