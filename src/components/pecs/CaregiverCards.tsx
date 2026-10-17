import { useState } from "react";
import { Pencil, Star } from "lucide-react";
import { useCardStore } from "@/store/cardStore";
import { selectVocabularyCards } from "@/lib/vocabularySelector";
import { translateCardLabel } from "@/lib/language";
import type { Card } from "@/pages/PecsApp";
import { Button } from "@/components/ui/button";
import { AddCardModal } from "./AddCardModal";

export const CaregiverCards = ({ onHome }: { onHome: () => void }) => {
  const cards = useCardStore(selectVocabularyCards);
  const favorites = useCardStore(state => state.favorites);
  const toggleFavorite = useCardStore(state => state.toggleFavorite);
  const language = useCardStore(state => state.language);
  const gender = useCardStore(state => state.characterGender);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Card | null>(null);
  const [adding, setAdding] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const visible = cards.filter(card => (!onlyFavorites || favorites.includes(card.id)) && translateCardLabel(card.text, language, gender).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><Button variant="outline" onClick={onHome}>Back</Button><h2 className="text-lg font-semibold">Manage cards</h2></div>
      <Button onClick={() => setAdding(true)}>Add a card</Button>
    </div>
    <div className="mb-5 flex gap-3">
      <input type="search" aria-label="Find a card to manage" placeholder="Find a card" value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-3" />
      <Button variant={onlyFavorites ? "default" : "outline"} aria-pressed={onlyFavorites} className="h-auto" onClick={() => setOnlyFavorites(!onlyFavorites)}>Favorites</Button>
    </div>
    <ul className="grid gap-2 sm:grid-cols-2">
      {visible.map(card => {
        const label = translateCardLabel(card.text, language, gender);
        const favorite = favorites.includes(card.id);
        return <li key={card.id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <span className="min-w-0 flex-1 break-words font-medium">{label}</span>
          {card.id.startsWith("custom-") && <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={`Edit ${label}`} onClick={() => setEditing(card)}><Pencil className="h-4 w-4" /></Button>}
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-pressed={favorite} aria-label={`${favorite ? "Remove" : "Add"} ${label} ${favorite ? "from" : "to"} favorites`} onClick={() => toggleFavorite(card.id)}><Star className={`h-5 w-5 ${favorite ? "fill-primary text-primary" : ""}`} /></Button>
        </li>;
      })}
    </ul>
    {!visible.length && <p className="py-8 text-center text-muted-foreground">No matching cards.</p>}
    <AddCardModal open={adding || Boolean(editing)} card={editing} onClose={() => { setAdding(false); setEditing(null); }} />
  </section>;
};
