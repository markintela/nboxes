"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AmberButton } from "@/components/Chrome";
import { DatePicker } from "@/components/DatePicker";
import { pal, TYPE_META, SCOPE_META } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export function ScheduleDialog({ open, onOpenChange, box, bands, defaultDate, defaultStartHour, onCreated }) {
  const startHour = defaultStartHour || "19";
  const endHour = String(Math.min(23, Number(startHour) + 2)).padStart(2, "0");

  const [form, setForm] = useState({
    name: "",
    type: "Ensaio",
    bandId: bands[0]?.id || "",
    scope: "banda",
    memberId: "",
    guestName: "",
    startHour,
    startMinute: "00",
    endHour,
    endMinute: "00",
    day: defaultDate?.day || 1,
    month: defaultDate?.month ?? 0,
    year: defaultDate?.year ?? new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      day: defaultDate?.day || f.day,
      month: defaultDate?.month ?? f.month,
      year: defaultDate?.year ?? f.year,
      startHour,
      startMinute: "00",
      endHour,
      endMinute: "00",
      bandId: bands[0]?.id || "",
      scope: "banda",
      memberId: "",
      guestName: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDate, defaultStartHour, open, bands]);

  const selectedBand = bands.find((b) => b.id === form.bandId);
  const members = selectedBand?.members || [];

  const submit = async () => {
    if (!form.name) return;
    if (form.scope === "individual" && !form.memberId) return;
    if (form.scope === "convidado" && !form.guestName) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("schedules")
      .insert({
        box_id: box.id,
        band_id: form.scope === "convidado" ? null : form.bandId || null,
        scope: form.scope,
        member_id: form.scope === "individual" ? form.memberId : null,
        guest_name: form.scope === "convidado" ? form.guestName : null,
        name: form.name,
        type: form.type,
        day: Number(form.day),
        month: Number(form.month),
        year: Number(form.year),
        time: `${form.startHour}:${form.startMinute}`,
        end_time: `${form.endHour}:${form.endMinute}`,
      })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCreated(data);
      onOpenChange(false);
    } else {
      // eslint-disable-next-line no-alert
      alert(`Erro ao agendar: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>Novo agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ensaio pré-show" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>

          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                {Object.keys(TYPE_META).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Agendamento para</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {Object.entries(SCOPE_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const active = form.scope === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, scope: key, memberId: "", guestName: "" })}
                    className="flex items-center justify-center gap-1.5 rounded-sm border py-2 text-xs font-display font-semibold transition-colors"
                    style={{
                      borderColor: pal.line,
                      background: active ? meta.color : "transparent",
                      color: active ? "#241C0F" : pal.creamDim,
                    }}
                  >
                    <Icon size={13} /> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {form.scope !== "convidado" && (
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Banda</Label>
              <Select value={form.bandId} onValueChange={(v) => setForm({ ...form, bandId: v, memberId: "" })}>
                <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                  {bands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.scope === "individual" && (
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Membro</Label>
              <Select value={form.memberId} onValueChange={(v) => setForm({ ...form, memberId: v })}>
                <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                  <SelectValue placeholder="Selecione o membro" />
                </SelectTrigger>
                <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.scope === "convidado" && (
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Nome do convidado</Label>
              <Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Ex: João (produtor)" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
            </div>
          )}

          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Data</Label>
            <DatePicker
              day={form.day}
              month={form.month}
              year={form.year}
              onChange={({ day, month, year }) => setForm({ ...form, day, month, year })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Hora inicial</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.startHour} onValueChange={(v) => setForm({ ...form, startHour: v })}>
                  <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} className="max-h-56">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>{h}h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.startMinute} onValueChange={(v) => setForm({ ...form, startMinute: v })}>
                  <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Hora final</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.endHour} onValueChange={(v) => setForm({ ...form, endHour: v })}>
                  <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} className="max-h-56">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>{h}h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.endMinute} onValueChange={(v) => setForm({ ...form, endMinute: v })}>
                  <SelectTrigger style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? "Marcando..." : "Marcar agendamento"}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
