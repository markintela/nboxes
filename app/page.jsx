"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet, CalendarDays, MessageCircle, Chrome } from "lucide-react";
import { pal } from "@/lib/theme";
import { LogoBadgeAnimated } from "@/components/Logo";
import { AmberButton, GhostButton } from "@/components/Chrome";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LandingPage() {
  const { user, loading, loginWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [createChoiceOpen, setCreateChoiceOpen] = useState(false);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: pal.bg }}>
        <p className="font-mono text-sm" style={{ color: pal.creamDim }}>{t("common.loading")}</p>
      </div>
    );
  }

  const submitEmail = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setFormError("");
    const { data, error } =
      mode === "signup"
        ? await signUpWithEmail(email, password, { emailRedirectTo: `${window.location.origin}/home` })
        : await signInWithEmail(email, password);
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    if (mode === "signup" && !data.session) setNeedsConfirmation(true);
  };

  const cards = [
    { icon: Plus, title: t("landing.cardCreateTitle"), desc: t("landing.cardCreateDesc") },
    { icon: CalendarDays, title: t("landing.cardScheduleTitle"), desc: t("landing.cardScheduleDesc") },
    { icon: Wallet, title: t("landing.cardExpensesTitle"), desc: t("landing.cardExpensesDesc") },
    { icon: MessageCircle, title: t("landing.cardShareTitle"), desc: t("landing.cardShareDesc") },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: pal.bg }}>
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${pal.amberSoft} 0%, transparent 55%)` }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <LogoBadgeAnimated size={168} />
          <p className="font-mono text-xs mt-4 tracking-[0.3em]" style={{ color: pal.creamDim }}>
            {t("landing.tagline")}
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl mt-10 leading-tight" style={{ color: pal.cream }}>
            {t("landing.heroTitle")}
          </h1>
          <p className="font-body text-base mt-4" style={{ color: pal.creamDim }}>
            {t("landing.heroSubtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10 w-full">
            {cards.map((f, i) => (
              <div key={i} className="p-4 rounded-sm border flex flex-col items-center text-center" style={{ borderColor: pal.line, background: pal.panel }}>
                <f.icon size={32} style={{ color: pal.amber }} />
                <p className="font-display text-sm font-semibold mt-3" style={{ color: pal.cream }}>{f.title}</p>
                <p className="font-body text-xs mt-1" style={{ color: pal.creamDim }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full sm:w-auto">
            <AmberButton icon={Chrome} onClick={() => loginWithGoogle()} className="justify-center">
              {t("landing.continueGoogle")}
            </AmberButton>
            <GhostButton onClick={() => { setMode("signin"); setEmailDialogOpen(true); }} className="justify-center">
              {t("landing.continueEmail")}
            </GhostButton>
            <GhostButton onClick={() => setCreateChoiceOpen(true)} className="justify-center">
              {t("landing.createAccount")}
            </GhostButton>
          </div>
        </div>
      </div>

      <Dialog open={createChoiceOpen} onOpenChange={setCreateChoiceOpen}>
        <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ color: pal.amber }}>{t("landing.createAccountTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <AmberButton
              icon={Chrome}
              onClick={() => { setCreateChoiceOpen(false); loginWithGoogle(); }}
              className="w-full justify-center"
            >
              {t("landing.createWithGoogle")}
            </AmberButton>
            <GhostButton
              onClick={() => { setCreateChoiceOpen(false); setMode("signup"); setEmailDialogOpen(true); }}
              className="w-full justify-center"
            >
              {t("landing.createWithEmail")}
            </GhostButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ color: pal.amber }}>
              {mode === "signup" ? t("landing.signUp") : t("landing.signIn")}
            </DialogTitle>
          </DialogHeader>
          {needsConfirmation ? (
            <p className="font-body text-xs mt-2" style={{ color: pal.creamDim }}>
              {t("landing.confirmEmailSent", { email })}
            </p>
          ) : (
            <div className="space-y-3 mt-2">
              <div>
                <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("landing.emailLabel")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("landing.emailPlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
              </div>
              <div>
                <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>{t("landing.passwordLabel")}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("landing.passwordPlaceholder")} style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
              </div>
              {formError && (
                <p className="font-mono text-[11px]" style={{ color: pal.red }}>{formError}</p>
              )}
              <AmberButton onClick={submitEmail} className="w-full justify-center">
                {submitting ? t("landing.processing") : mode === "signup" ? t("landing.signUp") : t("landing.signIn")}
              </AmberButton>
            </div>
          )}

          {!needsConfirmation && (
            <button
              type="button"
              onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setFormError(""); }}
              className="font-mono text-[11px] mt-4 w-full text-center hover:brightness-125"
              style={{ color: pal.brass }}
            >
              {mode === "signup" ? t("landing.alreadyHaveAccount") : t("landing.noAccount")}
            </button>
          )}
        </DialogContent>
      </Dialog>
      <div className="border-t py-4 text-center font-mono text-[11px]" style={{ borderColor: pal.line, color: pal.brass }}>
        NBOXES © {new Date().getFullYear()} — {t("landing.footer")}
      </div>
    </div>
  );
}
