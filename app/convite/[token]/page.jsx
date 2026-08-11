"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { pal } from "@/lib/theme";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton, GhostButton } from "@/components/Chrome";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();

  const [invite, setInvite] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    loadInvite();
    // A vinda de um redirect OAuth do Google perde todo o estado React (é uma nova
    // navegação), por isso usamos sessionStorage para lembrar que foi esta página
    // que iniciou o login, e assim saber que pode aceitar o convite automaticamente.
    if (typeof window !== "undefined" && sessionStorage.getItem("nboxes_invite_pending") === token) {
      sessionStorage.removeItem("nboxes_invite_pending");
      setAutoAccept(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadInvite() {
    setInviteLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_invite", { p_token: token }).maybeSingle();
    setInviteLoading(false);
    if (error || !data) {
      setInviteError("Este convite não existe ou é inválido.");
      return;
    }
    if (data.used_at) {
      setInviteError("Este convite já foi utilizado.");
      return;
    }
    setInvite(data);
  }

  // Só aceita automaticamente quando a autenticação aconteceu nesta página (Google
  // redirect-back ou submissão do formulário abaixo) — nunca para uma sessão que já
  // existia ao abrir o link, para não "sequestrar" o convite de outra pessoa.
  useEffect(() => {
    if (!invite || authLoading || !user || accepting || !autoAccept) return;
    acceptAndRedirect(createClient());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite, authLoading, user, autoAccept]);

  async function acceptAndRedirect(supabase) {
    setAccepting(true);
    const { data, error } = await supabase.rpc("accept_invite", { p_token: token }).maybeSingle();
    if (error) {
      setInviteError(error.message || "Não foi possível aceitar o convite.");
      setAccepting(false);
      return;
    }
    router.replace(`/box/${data.box_id}`);
  }

  const submitSignUp = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setFormError("");
    setAutoAccept(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    if (data.session) acceptAndRedirect(supabase);
    else setNeedsConfirmation(true);
  };

  const submitSignIn = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setFormError("");
    setAutoAccept(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    if (data.session) acceptAndRedirect(supabase);
  };

  const switchAccount = async () => {
    await logout();
    setAutoAccept(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-16" style={{ background: pal.bg }}>
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${pal.amberSoft} 0%, transparent 55%)` }}
      />
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        <Logo size="text-xl" />

        {inviteLoading ? (
          <p className="font-mono text-sm mt-8" style={{ color: pal.creamDim }}>A carregar convite…</p>
        ) : inviteError ? (
          <div className="mt-8 w-full rounded-md border p-5" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-display font-semibold" style={{ color: pal.red }}>{inviteError}</p>
            <p className="font-body text-xs mt-2" style={{ color: pal.creamDim }}>
              Pede a quem te convidou para enviar um novo link.
            </p>
            <GhostButton onClick={() => router.push("/")} className="mt-4 w-full justify-center">
              Ir para o nBoxes
            </GhostButton>
          </div>
        ) : authLoading || accepting ? (
          <p className="font-mono text-sm mt-8" style={{ color: pal.creamDim }}>A juntar-te à box…</p>
        ) : user && !autoAccept ? (
          <div className="mt-8 w-full rounded-md border p-5 text-left" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-body text-sm text-center" style={{ color: pal.cream }}>
              Foste convidado para <strong>{invite.member_name}</strong> te juntares à banda{" "}
              <strong>{invite.band_name}</strong> na box <strong>{invite.box_name}</strong>.
            </p>
            <p className="font-mono text-[11px] mt-4 text-center" style={{ color: pal.creamDim }}>
              Estás autenticado como <strong style={{ color: pal.cream }}>{user.email}</strong>.
            </p>
            <AmberButton
              onClick={() => { setAutoAccept(true); acceptAndRedirect(createClient()); }}
              className="justify-center w-full mt-4"
            >
              Aceitar convite
            </AmberButton>
            <button
              type="button"
              onClick={switchAccount}
              className="font-mono text-[11px] mt-3 w-full text-center hover:brightness-125"
              style={{ color: pal.brass }}
            >
              Não é a tua conta? Sair e usar outra
            </button>
          </div>
        ) : (
          <div className="mt-8 w-full rounded-md border p-5 text-left" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-body text-sm text-center" style={{ color: pal.cream }}>
              Foste convidado para <strong>{invite.member_name}</strong> te juntares à banda{" "}
              <strong>{invite.band_name}</strong> na box <strong>{invite.box_name}</strong>.
            </p>

            <AmberButton
              icon={Chrome}
              onClick={() => {
                sessionStorage.setItem("nboxes_invite_pending", token);
                loginWithGoogle(`/convite/${token}`);
              }}
              className="justify-center w-full mt-5"
            >
              Continuar com Google
            </AmberButton>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t" style={{ borderColor: pal.line }} />
              <span className="font-mono text-[11px]" style={{ color: pal.brass }}>OU</span>
              <span className="flex-1 border-t" style={{ borderColor: pal.line }} />
            </div>

            {needsConfirmation ? (
              <p className="font-body text-xs" style={{ color: pal.creamDim }}>
                Enviámos um email de confirmação para <strong>{email}</strong>. Confirma a tua conta e depois
                clica em "Entrar" abaixo com a mesma password.
              </p>
            ) : (
              <div className="space-y-3">
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
                <GhostButton
                  onClick={mode === "signup" ? submitSignUp : submitSignIn}
                  className="w-full justify-center"
                >
                  {submitting ? "A processar…" : mode === "signup" ? "Criar conta" : "Entrar"}
                </GhostButton>
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
          </div>
        )}
      </div>
    </div>
  );
}
