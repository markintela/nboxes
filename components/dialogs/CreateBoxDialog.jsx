"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton } from "@/components/Chrome";
import { pal } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

export function CreateBoxDialog({ open, onOpenChange, userId, onCreated }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ complexName: "", complexNumber: "", boxNumber: "", boxName: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.boxName || !form.complexName) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("boxes")
      .insert({
        complex_name: form.complexName,
        complex_number: form.complexNumber,
        box_number: form.boxNumber,
        box_name: form.boxName,
        owner_id: userId,
        split_method: "membro",
      })
      .select()
      .single();
    setSaving(false);
    if (!error) {
      onCreated(data);
      setForm({ complexName: "", complexNumber: "", boxNumber: "", boxName: "" });
      onOpenChange(false);
    } else {
      // eslint-disable-next-line no-alert
      alert(`${t("createBox.error")}: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: pal.amber }}>{t("createBox.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("createBox.complexNameLabel")}</Label>
            <Input value={form.complexName} onChange={set("complexName")} placeholder={t("createBox.complexNamePlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("createBox.complexNumberLabel")}</Label>
              <Input value={form.complexNumber} onChange={set("complexNumber")} placeholder="04" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
            </div>
            <div>
              <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("createBox.boxNumberLabel")}</Label>
              <Input value={form.boxNumber} onChange={set("boxNumber")} placeholder="12" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
            </div>
          </div>
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("createBox.boxNameLabel")}</Label>
            <Input value={form.boxName} onChange={set("boxName")} placeholder={t("createBox.boxNamePlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? t("createBox.creating") : t("createBox.create")}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
