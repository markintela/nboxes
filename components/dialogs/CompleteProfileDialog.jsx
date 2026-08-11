"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton } from "@/components/Chrome";
import { pal } from "@/lib/theme";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

export function CompleteProfileDialog({ open, userId, onCompleted }) {
  const { t } = useLanguage();
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
      alert(`${t("profile.error")}: ${error.message}`);
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
          <DialogTitle className="font-display" style={{ color: pal.amber }}>{t("profile.dialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("profile.nameLabel")}</Label>
            <Input value={form.name} onChange={set("name")} placeholder={t("profile.namePlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
          <div>
            <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("profile.nationalityLabel")}</Label>
            <Input value={form.nationality} onChange={set("nationality")} placeholder={t("profile.nationalityPlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <AmberButton onClick={submit}>{saving ? t("profile.saving") : t("profile.continue")}</AmberButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
