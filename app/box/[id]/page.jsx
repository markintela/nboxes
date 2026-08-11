"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus, Guitar, Crown, Building2, CircleUserRound,
  CalendarDays, Wallet, Users, UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { pal, EXP_META, computeSplit, fmtBRL } from "@/lib/theme";
import { AppHeader, AmberButton, TicketDivider } from "@/components/Chrome";
import { AgendaTab } from "@/components/AgendaTab";
import { AddExpenseDialog, AddBandDialog, AddMemberDialog } from "@/components/dialogs/OtherDialogs";
import { InviteMemberDialog } from "@/components/dialogs/InviteMemberDialog";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

/* --------------------------- FINANCEIRO TAB --------------------------- */
function FinanceiroTab({ box, bands, expenses, setExpenses, onChangeSplit }) {
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const split = computeSplit(box, expenses, bands);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg" style={{ color: pal.cream }}>{t("financeiro.monthExpenses")}</h3>
          <AmberButton icon={Plus} onClick={() => setDialogOpen(true)}>{t("financeiro.add")}</AmberButton>
        </div>
        <div className="rounded-md border divide-y" style={{ borderColor: pal.line }}>
          {expenses.map((exp) => {
            const meta = EXP_META[exp.tipo] || EXP_META.Outro;
            const Icon = meta.icon;
            return (
              <div key={exp.id} className="flex items-center justify-between px-4 py-3" style={{ background: pal.panel }}>
                <span className="flex items-center gap-2 font-body text-sm" style={{ color: pal.cream }}>
                  <Icon size={15} style={{ color: meta.color }} /> {t(`enums.expenseType.${exp.tipo}`)}
                  <span className="font-mono text-[11px]" style={{ color: pal.brass }}>· {exp.mes}</span>
                </span>
                <span className="font-mono text-sm" style={{ color: pal.amber }}>{fmtBRL(exp.valor)}</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: pal.panel2 }}>
            <span className="font-display text-sm font-semibold" style={{ color: pal.cream }}>{t("financeiro.total")}</span>
            <span className="font-mono text-sm font-semibold" style={{ color: pal.amber }}>{fmtBRL(split.totalExpense)}</span>
          </div>
        </div>

        <div className="rounded-md border p-4 flex items-center justify-between" style={{ borderColor: pal.line, background: pal.panel }}>
          <div>
            <p className="font-display text-sm font-semibold" style={{ color: pal.cream }}>{t("financeiro.splitByBandsTitle")}</p>
            <p className="font-mono text-[11px] mt-0.5" style={{ color: pal.creamDim }}>
              {box.split_method === "banda" ? t("financeiro.splitActive") : t("financeiro.splitInactive")}
            </p>
          </div>
          <Switch checked={box.split_method === "banda"} onCheckedChange={(v) => onChangeSplit(v ? "banda" : "membro")} />
        </div>
      </div>

      <div className="lg:col-span-3 space-y-3">
        <h3 className="font-display font-bold text-lg" style={{ color: pal.cream }}>{t("financeiro.revenueTitle")}</h3>
        <p className="font-mono text-[11px]" style={{ color: pal.brass }}>
          {t("financeiro.currentSplitLabel", { value: box.split_method === "banda" ? t("financeiro.perBand") : t("financeiro.perMember") })}
        </p>
        <div className="space-y-3">
          {split.bandTotals.map((bt) => (
            <div key={bt.bandId} className="rounded-md border overflow-hidden" style={{ borderColor: pal.line }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ background: pal.panel2 }}>
                <span className="flex items-center gap-2 font-display text-sm font-semibold" style={{ color: pal.cream }}>
                  <Guitar size={14} style={{ color: pal.amber }} /> {bt.name}
                </span>
                <span className="font-mono text-sm" style={{ color: pal.amber }}>{fmtBRL(bt.total)}</span>
              </div>
              <div className="divide-y" style={{ background: pal.panel }}>
                {bt.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-2">
                    <span className="flex items-center gap-2 font-body text-xs" style={{ color: pal.creamDim }}>
                      {m.is_admin && <Crown size={11} style={{ color: pal.amber }} />} {m.name}
                    </span>
                    <span className="font-mono text-xs" style={{ color: pal.cream }}>{fmtBRL(bt.perMember)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} box={box} onCreated={(exp) => setExpenses((prev) => [...prev, exp])} />
    </div>
  );
}

/* ------------------------------ BANDAS TAB ----------------------------- */
function BandsTab({ box, bands, setBands, isAdmin, userId }) {
  const { t } = useLanguage();
  const [bandDialogOpen, setBandDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [activeBand, setActiveBand] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState({ band: null, member: null });

  const openInvite = (band, member) => {
    setInviteTarget({ band, member });
    setInviteDialogOpen(true);
  };

  const toggleAdmin = async (bandId, memberId, current) => {
    const supabase = createClient();
    const { error } = await supabase.from("members").update({ is_admin: !current }).eq("id", memberId);
    if (!error) {
      setBands((prev) =>
        prev.map((b) =>
          b.id === bandId ? { ...b, members: b.members.map((m) => (m.id === memberId ? { ...m, is_admin: !current } : m)) } : b
        )
      );
    }
  };

  return (
    <div className="py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg" style={{ color: pal.cream }}>{t("bandas.title")}</h3>
        <AmberButton icon={Plus} onClick={() => setBandDialogOpen(true)}>{t("bandas.addBand")}</AmberButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bands.map((band) => (
          <div key={band.id} className="rounded-md border overflow-hidden" style={{ borderColor: pal.line }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: pal.panel2 }}>
              <span className="flex items-center gap-2 font-display font-semibold text-sm" style={{ color: pal.cream }}>
                <Guitar size={15} style={{ color: pal.amber }} /> {band.name}
              </span>
              <Badge style={{ background: pal.tealSoft, color: pal.teal }} className="border-0">
                {t("bandas.membersCountBadge", { count: band.members.length })}
              </Badge>
            </div>
            <div className="divide-y" style={{ background: pal.panel }}>
              {band.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="flex items-center gap-2 font-body text-sm" style={{ color: pal.cream }}>
                    <CircleUserRound size={15} style={{ color: pal.creamDim }} /> {m.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {!m.user_id && isAdmin && (
                      <button
                        onClick={() => openInvite(band, m)}
                        className="flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-sm hover:brightness-125"
                        style={{ color: pal.teal, background: pal.tealSoft }}
                      >
                        <UserPlus size={12} /> {t("bandas.invite")}
                      </button>
                    )}
                    <button
                      disabled={!isAdmin}
                      onClick={() => toggleAdmin(band.id, m.id, m.is_admin)}
                      className="flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded-sm"
                      style={{
                        color: m.is_admin ? pal.amber : pal.creamDim,
                        background: m.is_admin ? pal.amberSoft : "transparent",
                        opacity: isAdmin ? 1 : 0.5,
                        cursor: isAdmin ? "pointer" : "not-allowed",
                      }}
                    >
                      <Crown size={12} /> {m.is_admin ? t("bandas.admin") : t("bandas.member")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setActiveBand(band); setMemberDialogOpen(true); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 font-mono text-xs hover:brightness-125"
              style={{ background: pal.bg, color: pal.brass, borderTop: `1px dashed ${pal.line}` }}
            >
              <Plus size={12} /> {t("bandas.addMember")}
            </button>
          </div>
        ))}
      </div>

      <AddBandDialog open={bandDialogOpen} onOpenChange={setBandDialogOpen} box={box} onCreated={(band) => setBands((prev) => [...prev, band])} />
      <AddMemberDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        band={activeBand}
        onCreated={(bandId, member) =>
          setBands((prev) => prev.map((b) => (b.id === bandId ? { ...b, members: [...b.members, member] } : b)))
        }
      />
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        box={box}
        band={inviteTarget.band}
        member={inviteTarget.member}
        userId={userId}
      />
    </div>
  );
}

/* -------------------------------- PAGE --------------------------------- */
export default function BoxDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { t } = useLanguage();

  const [box, setBox] = useState(null);
  const [bands, setBands] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function loadAll() {
    setLoading(true);
    const supabase = createClient();
    const { data: boxRow } = await supabase.from("boxes").select("*").eq("id", id).single();
    const { data: bandRows } = await supabase.from("bands").select("*, members(*)").eq("box_id", id);
    const { data: scheduleRows } = await supabase.from("schedules").select("*").eq("box_id", id);
    const { data: expenseRows } = await supabase.from("expenses").select("*").eq("box_id", id);

    setBox(boxRow);
    setBands(bandRows || []);
    setSchedule(scheduleRows || []);
    setExpenses(expenseRows || []);
    setLoading(false);
  }

  const changeSplit = async (method) => {
    setBox((prev) => ({ ...prev, split_method: method }));
    const supabase = createClient();
    await supabase.from("boxes").update({ split_method: method }).eq("id", id);
  };

  const onLogout = async () => {
    await logout();
    router.replace("/");
  };

  const isAdmin = box?.owner_id === user?.id;

  if (authLoading || !user || loading || !box) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pal.bg }}>
        <p className="font-mono text-sm" style={{ color: pal.creamDim }}>{t("box.loadingBox")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: pal.bg }}>
      <AppHeader user={user} onLogout={onLogout} onBack={() => router.push("/home")} crumb={box.box_name} />

      <div className="px-5 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-3 rounded-md" style={{ background: pal.panel, border: `1px solid ${pal.line}` }}>
            <Building2 size={20} style={{ color: pal.amber }} />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-widest" style={{ color: pal.brass }}>
              {(box.complex_name || "").toUpperCase()} · {t("box.complexPrefix", { number: box.complex_number || "—" })}
            </p>
            <h1 className="font-display font-bold text-3xl" style={{ color: pal.cream }}>
              {t("box.boxTitle", { number: box.box_number || "—", name: box.box_name })}
            </h1>
          </div>
          {isAdmin && (
            <Badge style={{ background: pal.redSoft, color: pal.red }} className="border-0 ml-auto">
              <Crown size={11} className="mr-1 inline" /> {t("box.youAreAdmin")}
            </Badge>
          )}
        </div>

        <TicketDivider />

        <Tabs defaultValue="agenda" className="mt-2">
          <TabsList style={{ background: pal.panel, borderColor: pal.line }}>
            <TabsTrigger value="agenda" icon={CalendarDays}>{t("box.tabAgenda")}</TabsTrigger>
            <TabsTrigger value="financeiro" icon={Wallet}>{t("box.tabFinanceiro")}</TabsTrigger>
            <TabsTrigger value="bandas" icon={Users}>{t("box.tabBandas")}</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda">
            <AgendaTab box={box} bands={bands} schedule={schedule} setSchedule={setSchedule} />
          </TabsContent>
          <TabsContent value="financeiro">
            <FinanceiroTab box={box} bands={bands} expenses={expenses} setExpenses={setExpenses} onChangeSplit={changeSplit} />
          </TabsContent>
          <TabsContent value="bandas">
            <BandsTab box={box} bands={bands} setBands={setBands} isAdmin={isAdmin} userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
