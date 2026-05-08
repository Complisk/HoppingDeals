"use client";

// Minimal contact dialog — mirrors the live site's "Message Support" flow.
// The live deployment posts to a backend endpoint we don't yet have ported, so
// this component just collects the message and surfaces a toast. Wire it to a
// real /api/support endpoint once one exists.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { Button } from "@/presentation/components/ui/button";
import { useToast } from "@/presentation/hooks/use-toast";

export default function SupportMessageDialog({
  triggerLabel = "Message Support",
  triggerVariant,
  triggerSize,
  triggerClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.email || !payload.message) return;

    setSubmitting(true);
    try {
      // TODO: POST to /api/support once the backend route exists.
      console.info("[support] message captured", payload);
      toast({
        title: "Message sent",
        description: "We'll get back to you shortly.",
      });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Support</DialogTitle>
          <DialogDescription>
            Tell us what you need help with and we&rsquo;ll reach out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="support-name">Name</Label>
            <Input id="support-name" name="name" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Email</Label>
            <Input
              id="support-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <Textarea
              id="support-message"
              name="message"
              placeholder="How can we help?"
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
