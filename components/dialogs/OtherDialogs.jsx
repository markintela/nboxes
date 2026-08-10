"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AmberButton } from "@/components/Chrome";
import { pal, EXP_META, MONTH_NAMES } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

const now = new Date();

export function AddExpenseDialog({ open, onOpenChange, box, onCreated }) {
  const [form, setForm] = useState({ tipo: "Água", valor: "", mes: MONTH_NAMES[now.getMonth()] });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.valor) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({ box_id: box.id, tipo: form.tipo, valor: Number(form.valor), mes: form.mes })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCreated(data);
      onOpenChange(false);
      setForm({ tipo: "Água", valor: "", mes: MONTH_NAMES[now.getMonth()] });
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao adicionar despesa: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>Nova despesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                {Object.keys(EXP_META).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Valor (R$)</Label>
              <Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="150" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
            </div>
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Mês de referência</Label>
              <Input value={form.mes} onChange={(e) => setForm({ ...form, mes: e.target.value })} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? "Salvando..." : "Adicionar despesa"}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddBandDialog({ open, onOpenChange, box, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bands")
      .insert({ box_id: box.id, name })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCreated({ ...data, members: [] });
      setName("");
      onOpenChange(false);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao adicionar banda: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>Adicionar banda</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nome da banda</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Osso do Ofício" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? "Salvando..." : "Adicionar"}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddMemberDialog({ open, onOpenChange, band, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name || !band) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("members")
      .insert({ band_id: band.id, name, is_admin: false })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCreated(band.id, data);
      setName("");
      onOpenChange(false);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao adicionar membro: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>
            Adicionar membro {band ? `— ${band.name}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nome do membro</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Marcos Vinil" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? "Salvando..." : "Adicionar"}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
