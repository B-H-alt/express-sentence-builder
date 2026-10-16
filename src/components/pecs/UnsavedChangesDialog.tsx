import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

export const UnsavedChangesDialog = ({ open, onKeepEditing, onDiscard, onSave, description, canSave = true }: {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSave: () => void;
  description: string;
  canSave?: boolean;
}) => (
  <AlertDialog.Root open={open} onOpenChange={(next) => { if (!next) onKeepEditing(); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-[200] bg-black/40" />
      <AlertDialog.Content onClick={(event) => event.stopPropagation()}
        onEscapeKeyDown={(event) => { event.preventDefault(); event.stopPropagation(); onKeepEditing(); }}
        className="fixed left-1/2 top-1/2 z-[210] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 shadow-lg">
        <AlertDialog.Title className="text-lg font-semibold">Save before leaving?</AlertDialog.Title>
        <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">{description}</AlertDialog.Description>
        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" disabled={!canSave} onClick={onSave}>Save changes</Button>
          <Button type="button" variant="outline" onClick={onDiscard}>Leave without saving</Button>
          <AlertDialog.Cancel asChild><Button type="button" variant="ghost" onClick={onKeepEditing}>Keep editing</Button></AlertDialog.Cancel>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
