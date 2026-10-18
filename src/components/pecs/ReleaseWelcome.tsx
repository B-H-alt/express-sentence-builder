import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { hasSeenReleaseWelcome, markReleaseWelcomeSeen, type ReleaseAudience } from "@/lib/releaseWelcome";
import { useCardStore } from "@/store/cardStore";

export const ReleaseWelcome = ({ eligible, manual = false, onDismiss, audience = "app" }: { eligible: boolean; manual?: boolean; onDismiss?: () => void; audience?: ReleaseAudience }) => {
  const language = useCardStore(state => state.language);
  const es = language === "es";
  const [seen, setSeen] = useState(() => hasSeenReleaseWelcome(audience));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!eligible) return;
    if (manual || (!seen && !hasSeenReleaseWelcome(audience))) setOpen(true);
    else onDismiss?.();
  }, [eligible, seen, manual, audience, onDismiss]);
  const dismiss = () => { markReleaseWelcomeSeen(audience); setSeen(true); setOpen(false); onDismiss?.(); };
  const caregiver = audience === "caregiver";
  return <Dialog open={open && eligible} onOpenChange={next => { if (!next) dismiss(); }}>
    <DialogContent className="w-[calc(100%_-_2rem)] max-w-lg gap-0 rounded-2xl p-6 sm:p-8">
      <p className="mb-5 text-sm font-semibold text-primary">Expressly</p>
      <DialogTitle className="text-3xl font-semibold tracking-tight">{caregiver ? (es ? "Novedades para cuidadores" : "What’s new for caregivers") : (es ? "Expressly, renovado." : "Expressly, refreshed.")}</DialogTitle>
      <DialogDescription className="mb-6 mt-3 text-base leading-6">{caregiver ? (es ? "Tus herramientas, mejor organizadas." : "Your tools, better organized.") : (es ? "Más formas de expresarte. La misma voz: la tuya." : "More ways to express yourself. Still your voice.")}</DialogDescription>
      {caregiver ? <ul className="space-y-4 text-sm">
        <li><span className="block font-semibold">{es ? "Ajustes más claros" : "Clearer settings"}</span><span className="mt-1 block text-muted-foreground">{es ? "Perfil, vocabulario, pantalla y voz en sus propias secciones." : "Profile, vocabulary, display and voice in their own sections."}</span></li>
        <li><span className="block font-semibold">{es ? "Herramientas juntas" : "Board tools in one place"}</span><span className="mt-1 block text-muted-foreground">{es ? "Gestiona tarjetas favoritas, tarjetas personalizadas y frases guardadas." : "Manage favorites, custom cards and saved phrases."}</span></li>
        <li><span className="block font-semibold">{es ? "Navegación más fácil" : "Easier navigation"}</span><span className="mt-1 block text-muted-foreground">{es ? "El botón para volver permanece visible al desplazarte." : "The return button stays visible while you scroll."}</span></li>
      </ul> : <ul className="space-y-4 text-sm">
        <li><span className="block font-semibold">{es ? "Más vocabulario" : "More vocabulary"}</span><span className="mt-1 block text-muted-foreground">{es ? "Cinco niveles con más palabras y temas." : "Five levels, with more words and topics."}</span></li>
        <li><span className="block font-semibold">{es ? "Comunicación más fluida" : "Smoother communication"}</span><span className="mt-1 block text-muted-foreground">{es ? "Mejoras al tocar y desplazarte por las tarjetas." : "Refined card tapping and scrolling."}</span></li>
        <li><span className="block font-semibold">{es ? "A tu manera" : "Make it yours"}</span><span className="mt-1 block text-muted-foreground">{es ? "Nuevos ajustes de pantalla y un área para cuidadores." : "More display options and a dedicated caregiver area."}</span></li>
      </ul>}
      <div className="mt-7 flex flex-wrap gap-3"><Button onClick={dismiss}>{caregiver ? (es ? "Entendido" : "Got it") : (es ? "Explorar Expressly" : "Explore Expressly")}</Button>{!caregiver && <Button variant="ghost" onClick={dismiss}>{es ? "Ahora no" : "Not now"}</Button>}</div>
    </DialogContent>
  </Dialog>;
};
