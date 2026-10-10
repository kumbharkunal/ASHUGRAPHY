import { WarningCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";

/**
 * The helper or error under a form field. While an error shows it replaces the helper (the error
 * copy already carries the hint), and it never relies on colour alone.
 */
export function fieldDescribedBy(id: string, helper?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  return helper ? `${id}-helper` : undefined;
}

export function FieldNotes({ id, helper, error }: { id: string; helper?: string; error?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-sindoor-deep">
        <WarningCircle weight="regular" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {error}
      </p>
    );
  }
  if (!helper) return null;
  return (
    <p id={`${id}-helper`} className="mt-2 text-sm text-ink-soft">
      {helper}
    </p>
  );
}
