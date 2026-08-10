"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic2, DollarSign, Crown, Chrome } from "lucide-react";
import { pal } from "@/lib/theme";
import { LogoBadge } from "@/components/Logo";
import { AmberButton, GhostButton } from "@/components/Chrome";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: pal.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${pal.amberSoft} 0%, transparent 55%)` }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <LogoBadge size={168} />
          <p className="font-mono text-xs mt-4 tracking-[0.3em]" style={{ color: pal.creamDim }}>
            AGENDA · DIVIDE · TOCA
          </p>

          <h1 className="font-display font-bold text-3xl md:text-4xl mt-10 leading-tight" style={{ color: pal.cream }}>
            Sua sala de ensaio, sem confusão de agenda nem de conta.
          </h1>
          <p className="font-body text-base mt-4" style={{ color: pal.creamDim }}>
            Cadastre seus boxes, marque ensaios, gravações e ajustes num calendário só seu, e divida água,
            luz e internet entre as bandas ou entre os membros.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 w-full">
            {[
              { icon: Mic2, title: "Agenda cheia", desc: "Ensaio, gravação e ajuste num calendário só." },
              { icon: DollarSign, title: "Conta dividida", desc: "Por banda ou por integrante, sem fricção." },
              { icon: Crown, title: "Quem manda", desc: "Admin da box decide quem mais administra." },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-sm border text-left" style={{ borderColor: pal.line, background: pal.panel }}>
                <f.icon size={18} style={{ color: pal.amber }} />
                <p className="font-display text-sm font-semibold mt-2" style={{ color: pal.cream }}>{f.title}</p>
                <p className="font-body text-xs mt-1" style={{ color: pal.creamDim }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full sm:w-auto">
            <AmberButton icon={Chrome} onClick={loginWithGoogle} className="justify-center">
              Continuar com Google
            </AmberButton>
            <GhostButton onClick={loginWithGoogle} className="justify-center">
              Criar conta com Google
            </GhostButton>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center font-mono text-[11px]" style={{ borderColor: pal.line, color: pal.brass }}>
        nBoxes © {new Date().getFullYear()} — feito para quem vive de ensaio marcado em cima da hora.
      </div>
    </div>
  );
}
