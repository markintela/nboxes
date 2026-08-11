"use client";

import React, { useEffect, useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton, GhostButton } from "@/components/Chrome";
import { pal } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

export function InviteMemberDialog({ open, onOpenChange, box, band, member, userId }) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !member) return;
    setLink("");
    setCopied(false);
    createInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member]);

  const createInvite = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("invites")
      .insert({ box_id: box.id, band_id: band.id, member_id: member.id, created_by: userId })
      .select("token")
      .single();
    setLoading(false);
    if (!error) {
      setLink(`${window.location.origin}/convite/${data.token}`);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao criar convite: ${error.message}`);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = link
    ? `https://wa.me/?text=${encodeURIComponent(
        `Olá ${member?.name}! Junta-te à banda ${band?.name} na box ${box?.box_name} pelo nBoxes: ${link}`
      )}`
    : "#";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>
            Convidar {member?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <p className="font-body text-xs" style={{ color: pal.creamDim }}>
            Este link dá acesso à box <strong>{box?.box_name}</strong> como membro de <strong>{band?.name}</strong>.
            Só pode ser usado uma vez.
          </p>
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Link de convite</Label>
            <div className="flex gap-2">
              <Input readOnly value={loading ? "A gerar…" : link} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
              <GhostButton onClick={copyLink} className="shrink-0 px-3">
                {copied ? <Check size={16} style={{ color: pal.teal }} /> : <Copy size={16} />}
              </GhostButton>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <AmberButton icon={MessageCircle} type="button">Enviar por WhatsApp</AmberButton>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
