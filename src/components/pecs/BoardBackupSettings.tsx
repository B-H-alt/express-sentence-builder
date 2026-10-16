import { useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { downloadExpresslyData } from "@/lib/accountDataExport";
import { MAX_BACKUP_BYTES, parseBoardBackup, restoreBoardBackup, type BoardBackup } from "@/lib/boardBackup";

export const BoardBackupSettings = ({ disabled, onRestored }: { disabled: boolean; onRestored: () => void }) => {
  const input = useRef<HTMLInputElement>(null);
  const scope = useRef<string | null>(null);
  const [backup, setBackup] = useState<BoardBackup | null>(null);
  const [message, setMessage] = useState("");
  const [savedCurrent, setSavedCurrent] = useState(false);
  const { setTheme } = useTheme();
  const download = () => {
    try { downloadExpresslyData(); setSavedCurrent(true); setMessage("Backup downloaded. Keep it somewhere private."); }
    catch { setMessage("The backup could not be downloaded. Please try again."); }
  };
  return (
    <details className="mt-6 rounded-xl border border-border p-4">
      <summary className="cursor-pointer text-sm font-semibold">Backup</summary>
      <p className="mt-3 text-xs text-muted-foreground">Save cards, photos, and settings to a file. Keep it private.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={disabled} onClick={download}>Download backup</Button>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => input.current?.click()}>Restore from file</Button>
      </div>
      {disabled && <p className="mt-2 text-xs text-muted-foreground">Save or cancel your settings edits first.</p>}
      <input ref={input} type="file" accept=".json,application/json" className="hidden" aria-label="Choose Expressly backup" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = "";
        if (!file) return;
        const selectedScope = localStorage.getItem("expressly-active-account-scope-v1");
        setMessage(""); setSavedCurrent(false); setBackup(null);
        try {
          if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 5 MB.");
          const parsed = parseBoardBackup(await file.text());
          if (selectedScope !== localStorage.getItem("expressly-active-account-scope-v1")) throw new Error("The account changed. Choose your backup again.");
          scope.current = selectedScope; setBackup(parsed);
        } catch (error) { setMessage(error instanceof Error ? error.message : "This backup could not be read."); }
      }} />
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
      <AlertDialog.Root open={Boolean(backup)} onOpenChange={open => { if (!open) setBackup(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[200] bg-black/40" />
          <AlertDialog.Content onClick={event => event.stopPropagation()} onEscapeKeyDown={event => { event.preventDefault(); event.stopPropagation(); setBackup(null); }} className="fixed left-1/2 top-1/2 z-[210] max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold">Restore this backup?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">This replaces the current board, profile, phrases, and activity on this device. Your account and Parent Mode PIN stay unchanged.</AlertDialog.Description>
            {backup && <p className="mt-4 text-sm">{backup.learnerProfile.name || "Learner"} · {backup.customCards.length} custom cards · {new Date(backup.exportedAt).toLocaleDateString()}</p>}
            <p className="mt-3 text-xs text-muted-foreground">Download the current board before replacing it. Remote image links still need internet.</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="outline" onClick={download}>Download current backup</Button>
              <Button disabled={!savedCurrent || disabled} onClick={() => {
                if (!backup) return;
                try {
                  if (scope.current !== localStorage.getItem("expressly-active-account-scope-v1")) throw new Error("The account changed. Choose your backup again.");
                  restoreBoardBackup(backup);
                  if (backup.preferences.theme) setTheme(backup.preferences.theme);
                  setBackup(null); onRestored();
                } catch (error) { setBackup(null); setMessage(error instanceof Error ? error.message : "The backup could not be restored."); }
              }}>Replace with backup</Button>
              <AlertDialog.Cancel asChild><Button variant="ghost">Cancel</Button></AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </details>
  );
};
