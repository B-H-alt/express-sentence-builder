import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const guideSteps = [
  {
    title: "Choose a card",
    text: "Use the categories or search box to find a word, then tap the card.",
  },
  {
    title: "Build the sentence",
    text: "Each card appears in My Sentence. Use the small x on a card to remove it.",
  },
  {
    title: "Share the message",
    text: "Finish the sentence to show it clearly, or use Speak to read it aloud.",
  },
  {
    title: "Use Speak now when it is urgent",
    text: "Common messages like Yes, No, Stop, and I need help can be spoken with one tap.",
  },
];

export const AppGuideDialog = ({ open, onOpenChange }: AppGuideDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-border/70">
      <DialogHeader>
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <DialogTitle>How to use Expressly</DialogTitle>
        <DialogDescription>
          Four things to know before you begin.
        </DialogDescription>
      </DialogHeader>

      <ol className="space-y-3">
        {guideSteps.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{step.title}</span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <Button className="w-full" onClick={() => onOpenChange(false)}>
        Start using Expressly
      </Button>
    </DialogContent>
  </Dialog>
);
