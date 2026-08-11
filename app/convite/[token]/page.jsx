"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { pal } from "@/lib/theme";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmberButton, GhostButton } from "@/components/Chrome";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { t } = useLanguage();

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
      setInviteError(t("inviteAccept.invalidTitle"));
      return;
    }
    if (data.used_at) {
      setInviteError(t("inviteAccept.usedTitle"));
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
      setInviteError(error.message || t("inviteAccept.genericError"));
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
    sessionStorage.setItem("nboxes_invite_pending", token);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/convite/${token}` },
    });
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
      <div className="absolute top-5 right-5 z-20">
        <LanguageSwitcher />
      </div>
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${pal.amberSoft} 0%, transparent 55%)` }}
      />
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        <Logo size="text-xl" />

        {inviteLoading ? (
          <p className="font-mono text-sm mt-8" style={{ color: pal.creamDim }}>{t("inviteAccept.loadingInvite")}</p>
        ) : inviteError ? (
          <div className="mt-8 w-full rounded-md border p-5" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-display font-semibold" style={{ color: pal.red }}>{inviteError}</p>
            <p className="font-body text-xs mt-2" style={{ color: pal.creamDim }}>
              {t("inviteAccept.askNewLink")}
            </p>
            <GhostButton onClick={() => router.push("/")} className="mt-4 w-full justify-center">
              {t("inviteAccept.goHome")}
            </GhostButton>
          </div>
        ) : authLoading || accepting ? (
          <p className="font-mono text-sm mt-8" style={{ color: pal.creamDim }}>{t("inviteAccept.joining")}</p>
        ) : user && !autoAccept ? (
          <div className="mt-8 w-full rounded-md border p-5 text-left" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-body text-sm text-center" style={{ color: pal.cream }}>
              {t("inviteAccept.invitedTo", { member: invite.member_name, band: invite.band_name, box: invite.box_name })}
            </p>
            <p className="font-mono text-[11px] mt-4 text-center" style={{ color: pal.creamDim }}>
              {t("inviteAccept.authenticatedAs", { email: user.email })}
            </p>
            <AmberButton
              onClick={() => { setAutoAccept(true); acceptAndRedirect(createClient()); }}
              className="justify-center w-full mt-4"
            >
              {t("inviteAccept.acceptInvite")}
            </AmberButton>
            <button
              type="button"
              onClick={switchAccount}
              className="font-mono text-[11px] mt-3 w-full text-center hover:brightness-125"
              style={{ color: pal.brass }}
            >
              {t("inviteAccept.wrongAccount")}
            </button>
          </div>
        ) : (
          <div className="mt-8 w-full rounded-md border p-5 text-left" style={{ borderColor: pal.line, background: pal.panel }}>
            <p className="font-body text-sm text-center" style={{ color: pal.cream }}>
              {t("inviteAccept.invitedTo", { member: invite.member_name, band: invite.band_name, box: invite.box_name })}
            </p>

            <AmberButton
              icon={Chrome}
              onClick={() => {
                sessionStorage.setItem("nboxes_invite_pending", token);
                loginWithGoogle(`/convite/${token}`);
              }}
              className="justify-center w-full mt-5"
            >
              {t("landing.continueGoogle")}
            </AmberButton>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 border-t" style={{ borderColor: pal.line }} />
              <span className="font-mono text-[11px]" style={{ color: pal.brass }}>{t("inviteAccept.or")}</span>
              <span className="flex-1 border-t" style={{ borderColor: pal.line }} />
            </div>

            {needsConfirmation ? (
              <p className="font-body text-xs" style={{ color: pal.creamDim }}>
                {t("inviteAccept.confirmEmailSent", { email })}
              </p>
            ) : (
              <div className="space-y-3">
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
                <GhostButton
                  onClick={mode === "signup" ? submitSignUp : submitSignIn}
                  className="w-full justify-center"
                >
                  {submitting ? t("landing.processing") : mode === "signup" ? t("landing.signUp") : t("landing.signIn")}
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
                {mode === "signup" ? t("landing.alreadyHaveAccount") : t("landing.noAccount")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
