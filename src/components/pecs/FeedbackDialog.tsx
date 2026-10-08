import { FormEvent, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeedbackDialog = ({ open, onOpenChange }: FeedbackDialogProps) => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const message = feedback.trim();
    if (!message) return;

    const body = [
      message,
      "",
      email.trim() ? `Reply to: ${email.trim()}` : "No reply email provided.",
    ].join("\n");
    window.location.href = `mailto:expressly54@gmail.com?subject=${encodeURIComponent("Expressly feedback")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border/70">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Tell us what worked, what felt confusing, or what would make Expressly easier to use.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Your feedback</span>
            <textarea
              required
              maxLength={1500}
              rows={5}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="What would you like us to know?"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">
              Email <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="If you would like a reply"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </label>

          <Button type="submit" className="w-full">Send feedback</Button>
          <p className="text-center text-xs text-muted-foreground">
            This opens your email app so you can review the message before sending it.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
