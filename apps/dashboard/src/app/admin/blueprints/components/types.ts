export type FieldType = 'string' | 'int' | 'enum';

export interface Field {
  fieldName: string;
  fieldSlug: string;
  fieldType: FieldType;
  fieldOptions?: string[];
}

export interface Blueprint {
  id: string;
  name: string;
  imageUrl?: string;
  sections: string[];
  fields: Field[];
}

export interface BlueprintCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  blueprint?: Blueprint; // Optional blueprint for editing
}
