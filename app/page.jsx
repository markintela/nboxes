"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet, CalendarDays, MessageCircle, Chrome } from "lucide-react";
import { pal } from "@/lib/theme";
import { LogoBadgeAnimated } from "@/components/Logo";
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
            <GhostButton onClick={() => loginWithGoogle()} className="justify-center">
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
