import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  translations: {
    cancel: string;
    submitLoading: string;
    submitIdle: string;
  };
}

export const FormActions = ({
  onCancel,
  isLoading,
  isDisabled,
  translations,
}: FormActionsProps) => {
  return (
    <div className="border-t border-border p-6 flex justify-end gap-3 shrink-0 bg-background">
      <Button type="button" variant="outline" onClick={onCancel}>
        {translations.cancel}
      </Button>
      <Button
        type="submit"
        disabled={isLoading || isDisabled}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? translations.submitLoading : translations.submitIdle}
      </Button>
    </div>
  );
};
