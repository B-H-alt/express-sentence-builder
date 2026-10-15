import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { translateCardLabel } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SpeakNowBar } from "./SpeakNowBar";

export const SavedPhrases = ({ onHome }: { onHome: () => void }) => {
  const phrases = useCardStore((state) => state.savedPhrases);
  const language = useCardStore((state) => state.language);
  const savePhrase = useCardStore((state) => state.savePhrase);
  const removePhrase = useCardStore((state) => state.removeSavedPhrase);
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const es = language === "es";
  const visible = phrases.filter((phrase) => phrase.language === language);

  const openAdd = () => {
    const state = useCardStore.getState();
    setText(state.sentence.map((card) => translateCardLabel(card.text, language, state.characterGender)).join(" ").slice(0, 240));
    setError("");
    setAdding(true);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="saved-phrases-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onHome}><ArrowLeft className="mr-2 h-4 w-4" />{es ? "Inicio" : "Home"}</Button>
          <h2 id="saved-phrases-title" className="text-lg font-semibold">{es ? "Frases guardadas" : "Saved phrases"}</h2>
        </div>
        <div className="flex items-center gap-2">
          {visible.length > 0 && <Button variant="ghost" onClick={() => setManaging(!managing)}>{managing ? (es ? "Listo" : "Done") : (es ? "Organizar" : "Manage")}</Button>}
          <Button variant="outline" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />{es ? "Añadir frase" : "Add phrase"}</Button>
        </div>
      </div>
      <p className="mb-5 mt-4 text-sm text-muted-foreground">{es ? "Toca una frase para decirla. Se guarda en este dispositivo." : "Tap a phrase to speak. Saved on this device."}</p>
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="font-medium">{es ? "Guarda algo que dices a menudo." : "Keep something you say often."}</p>
          <p className="mt-2 text-sm text-muted-foreground">{es ? "Por ejemplo: Necesito un descanso." : "For example: I need a break."}</p>
        </div>
      ) : managing ? (
        <ul className="space-y-2">
          {visible.map((phrase) => <li key={phrase.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{phrase.text}</span>
            <Button variant="ghost" size="icon" onClick={() => setRemoving(phrase.id)} aria-label={`${es ? "Eliminar" : "Remove"} ${phrase.text}`} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </li>)}
        </ul>
      ) : <SpeakNowBar phrases={visible.map((phrase) => phrase.text)} />}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{es ? "Añadir frase" : "Add phrase"}</DialogTitle>
            <DialogDescription>{es ? "Escribe las palabras tal como quieres decirlas." : "Write the words exactly as you want to say them."}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!savePhrase(text)) { setError(es ? "Esta frase ya está guardada o has llegado al límite de 50." : "This phrase is already saved, or you've reached the limit of 50."); return; }
            setAdding(false);
            setManaging(false);
          }}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">{es ? "Tu frase" : "Your phrase"}</span>
              <textarea required maxLength={240} rows={3} value={text} onChange={(event) => { setText(event.target.value); setError(""); }} className="w-full rounded-xl border border-border bg-background p-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>{es ? "Cancelar" : "Cancel"}</Button>
              <Button type="submit" disabled={!text.trim()}>{es ? "Guardar frase" : "Save phrase"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(removing)} onOpenChange={(open) => { if (!open) setRemoving(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{es ? "¿Eliminar esta frase?" : "Remove this phrase?"}</DialogTitle>
            <DialogDescription>{phrases.find((phrase) => phrase.id === removing)?.text}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRemoving(null)}>{es ? "Cancelar" : "Cancel"}</Button>
            <Button variant="destructive" onClick={() => { if (removing) removePhrase(removing); setRemoving(null); }}>{es ? "Eliminar" : "Remove phrase"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
