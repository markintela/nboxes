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
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { user, loading, loginWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
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
        <p className="font-mono text-sm" style={{ color: pal.creamDim }}>A carregar…</p>
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

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: pal.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${pal.amberSoft} 0%, transparent 55%)` }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <LogoBadgeAnimated size={168} />
          <p className="font-mono text-xs mt-4 tracking-[0.3em]" style={{ color: pal.creamDim }}>
            MOVIMENTO · ARTE · MÚSICA
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl mt-10 leading-tight" style={{ color: pal.cream }}>
            Onde o movimento vira som, e a tua agenda entra no ritmo.
          </h1>
          <p className="font-body text-base mt-4" style={{ color: pal.creamDim }}>
            Regista as tuas boxes e marca ensaios, gravações e ajustes num calendário só teu, para que a única
            coisa que precises de afinar seja o som. Divide a água, a luz e a internet entre as bandas ou entre
            os membros.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10 w-full">
            {[
              { icon: Plus, title: "CRIE", desc: "Regista as tuas boxes, cria bandas e adiciona membros em poucos cliques." },
              { icon: CalendarDays, title: "AGENDE", desc: "Marca ensaios, gravações e ajustes, e vê tudo por dia, semana, mês ou trimestre." },
              { icon: Wallet, title: "GERENCIE DESPESAS", desc: "Divide a água, a luz e a internet por banda ou por membro, sem complicações." },
              { icon: MessageCircle, title: "COMPARTILHE", desc: "Convida a tua banda por WhatsApp — o membro entra direto na tua box." },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-sm border flex flex-col items-center text-center" style={{ borderColor: pal.line, background: pal.panel }}>
                <f.icon size={32} style={{ color: pal.amber }} />
                <p className="font-display text-sm font-semibold mt-3" style={{ color: pal.cream }}>{f.title}</p>
                <p className="font-body text-xs mt-1" style={{ color: pal.creamDim }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full sm:w-auto">
            <AmberButton icon={Chrome} onClick={() => loginWithGoogle()} className="justify-center">
              Continuar com Google
            </AmberButton>
            <GhostButton onClick={() => { setMode("signin"); setEmailDialogOpen(true); }} className="justify-center">
              Continuar com Email
            </GhostButton>
            <GhostButton onClick={() => setCreateChoiceOpen(true)} className="justify-center">
              Criar conta
            </GhostButton>
          </div>
        </div>
      </div>

      <Dialog open={createChoiceOpen} onOpenChange={setCreateChoiceOpen}>
        <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ color: pal.amber }}>Criar conta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <AmberButton
              icon={Chrome}
              onClick={() => { setCreateChoiceOpen(false); loginWithGoogle(); }}
              className="w-full justify-center"
            >
              Criar com Google
            </AmberButton>
            <GhostButton
              onClick={() => { setCreateChoiceOpen(false); setMode("signup"); setEmailDialogOpen(true); }}
              className="w-full justify-center"
            >
              Criar com email
            </GhostButton>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent style={{ background: pal.panel, borderColor: pal.line, color: pal.cream }}>
          <DialogHeader>
            <DialogTitle className="font-display" style={{ color: pal.amber }}>
              {mode === "signup" ? "Criar conta" : "Entrar"}
            </DialogTitle>
          </DialogHeader>
          {needsConfirmation ? (
            <p className="font-body text-xs mt-2" style={{ color: pal.creamDim }}>
              Enviámos um email de confirmação para <strong>{email}</strong>. Confirma a tua conta e depois
              entra com a mesma palavra-passe.
            </p>
          ) : (
            <div className="space-y-3 mt-2">
              <div>
                <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="o-teu-email@exemplo.com" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
              </div>
              <div>
                <Label className="font-mono text-xs" style={{ color: pal.creamDim }}>Palavra-passe</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }} />
              </div>
              {formError && (
                <p className="font-mono text-[11px]" style={{ color: pal.red }}>{formError}</p>
              )}
              <AmberButton onClick={submitEmail} className="w-full justify-center">
                {submitting ? "A processar…" : mode === "signup" ? "Criar conta" : "Entrar"}
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
              {mode === "signup" ? "Já tens conta? Entrar" : "Ainda não tens conta? Criar conta"}
            </button>
          )}
        </DialogContent>
      </Dialog>
      <div className="border-t py-4 text-center font-mono text-[11px]" style={{ borderColor: pal.line, color: pal.brass }}>
        NBOXES © {new Date().getFullYear()} — onde o som encontra comunidade, ensaio após ensaio.
      </div>
    </div>
  );
}
