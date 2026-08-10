"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton } from "@/components/Chrome";
import { pal } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

export function CompleteProfileDialog({ open, userId, onCompleted }) {
  const [form, setForm] = useState({ name: "", nationality: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.nationality) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, name: form.name, nationality: form.nationality })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCompleted(data);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao guardar perfil: ${error.message}`);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}
      >
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>Completa o teu perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nome</Label>
            <Input value={form.name} onChange={set("name")} placeholder="O teu nome" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nacionalidade</Label>
            <Input value={form.nationality} onChange={set("nationality")} placeholder="Ex: Portuguesa" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? "Guardando..." : "Continuar"}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
