export type FieldType = 'string' | 'int' | 'enum';

export interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

export interface BlueprintCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
