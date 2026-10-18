import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { hasSeenReleaseWelcome, markReleaseWelcomeSeen } from "@/lib/releaseWelcome";
import { useCardStore } from "@/store/cardStore";

export const ReleaseWelcome = ({ eligible }: { eligible: boolean }) => {
  const language = useCardStore(state => state.language);
  const es = language === "es";
  const [seen, setSeen] = useState(hasSeenReleaseWelcome);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (eligible && !seen && !hasSeenReleaseWelcome()) setOpen(true);
  }, [eligible, seen]);
  const dismiss = () => { markReleaseWelcomeSeen(); setSeen(true); setOpen(false); };
  return <Dialog open={open && eligible} onOpenChange={next => { if (!next) dismiss(); }}>
    <DialogContent className="w-[calc(100%_-_2rem)] max-w-lg gap-0 rounded-2xl p-6 sm:p-8">
      <p className="mb-5 text-sm font-semibold text-primary">Expressly</p>
      <DialogTitle className="text-3xl font-semibold tracking-tight">{es ? "Expressly, renovado." : "Expressly, refreshed."}</DialogTitle>
      <DialogDescription className="mb-6 mt-3 text-base leading-6">{es ? "Más formas de expresarte. La misma voz: la tuya." : "More ways to express yourself. Still your voice."}</DialogDescription>
      <ul className="space-y-4 text-sm">
        <li><span className="block font-semibold">{es ? "Más vocabulario" : "More vocabulary"}</span><span className="mt-1 block text-muted-foreground">{es ? "Cinco niveles con más palabras y temas." : "Five levels, with more words and topics."}</span></li>
        <li><span className="block font-semibold">{es ? "Comunicación más fluida" : "Smoother communication"}</span><span className="mt-1 block text-muted-foreground">{es ? "Mejoras al tocar y desplazarte por las tarjetas." : "Refined card tapping and scrolling."}</span></li>
        <li><span className="block font-semibold">{es ? "A tu manera" : "Make it yours"}</span><span className="mt-1 block text-muted-foreground">{es ? "Nuevos ajustes de pantalla y un área para cuidadores." : "More display options and a dedicated caregiver area."}</span></li>
      </ul>
      <div className="mt-7 flex flex-wrap gap-3"><Button onClick={dismiss}>{es ? "Explorar Expressly" : "Explore Expressly"}</Button><Button variant="ghost" onClick={dismiss}>{es ? "Ahora no" : "Not now"}</Button></div>
    </DialogContent>
  </Dialog>;
};
