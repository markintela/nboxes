"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Guitar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pal } from "@/lib/theme";
import { AppHeader, AmberButton } from "@/components/Chrome";
import { LogoBadge, NBoxIcon } from "@/components/Logo";
import { CreateBoxDialog } from "@/components/dialogs/CreateBoxDialog";
import { CompleteProfileDialog } from "@/components/dialogs/CompleteProfileDialog";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createClient } from "@/lib/supabase/client";

function BoxCard({ box, isOwner, onOpen }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-md overflow-hidden border hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: pal.line, background: pal.panel }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-widest" style={{ color: pal.brass }}>
            {t("home.complexLabel", { number: box.complex_number || "—" })}
          </span>
          <div className="flex items-center gap-1.5">
            {!isOwner && (
              <Badge style={{ background: pal.tealSoft, color: pal.teal }} className="border-0">
                {t("home.memberBadge")}
              </Badge>
            )}
            <Badge style={{ background: pal.amberSoft, color: pal.amber }} className="border-0">
              {t("home.boxLabel", { number: box.box_number || "—" })}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <NBoxIcon size={26} />
          <h3 className="font-display font-bold text-2xl" style={{ color: pal.cream }}>{box.box_name}</h3>
        </div>
        <p className="font-body text-xs mt-1" style={{ color: pal.creamDim }}>{box.complex_name}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: pal.creamDim }}>
            <Guitar size={13} style={{ color: pal.amber }} /> {t("home.bandsCount", { count: box.bandCount || 0 })}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: pal.creamDim }}>
            <Users size={13} style={{ color: pal.teal }} /> {t("home.membersCount", { count: box.memberCount || 0 })}
          </span>
        </div>
      </div>
      <div className="stub-dots h-3 w-full" />
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: pal.panel2 }}>
        <span className="font-mono text-[11px]" style={{ color: pal.brass }}>{t("home.accessGranted")}</span>
        <span className="font-display text-sm font-semibold" style={{ color: pal.amber }}>{t("home.openBox")}</span>
      </div>
    </button>
  );
}

export default function HomePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    checkProfile();
    loadBoxes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function checkProfile() {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    setNeedsProfile(!data);
  }

  async function loadBoxes() {
    setLoading(true);
    const supabase = createClient();
    const { data: boxRows, error } = await supabase
      .from("boxes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const withCounts = await Promise.all(
      (boxRows || []).map(async (box) => {
        const { data: bandRows } = await supabase
          .from("bands")
          .select("id, members(id)")
          .eq("box_id", box.id);
        const bandCount = bandRows?.length || 0;
        const memberCount = (bandRows || []).reduce((s, b) => s + (b.members?.length || 0), 0);
        return { ...box, bandCount, memberCount };
      })
    );

    setBoxes(withCounts);
    setLoading(false);
  }

  const onLogout = async () => {
    await logout();
    router.replace("/");
  };

  const firstName = (user?.user_metadata?.full_name || user?.email || "").split(" ")[0] || "";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pal.bg }}>
        <p className="font-mono text-sm" style={{ color: pal.creamDim }}>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: pal.bg }}>
      <AppHeader user={user} onLogout={onLogout} />
      <div className="px-5 md:px-8 py-8 max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest" style={{ color: pal.brass }}>{t("home.myBoxes")}</p>
            <h1 className="font-display font-bold text-3xl mt-1" style={{ color: pal.cream }}>
              {t("home.greeting", { name: firstName })}
            </h1>
          </div>
          <AmberButton icon={Plus} onClick={() => setDialogOpen(true)}>{t("home.newBox")}</AmberButton>
        </div>

        {loading ? (
          <p className="font-mono text-sm mt-10" style={{ color: pal.creamDim }}>{t("home.loadingBoxes")}</p>
        ) : boxes.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <LogoBadge size={120} />
            <p className="font-body text-sm mt-4 max-w-sm" style={{ color: pal.creamDim }}>
              {t("home.emptyText")}
            </p>
            <AmberButton icon={Plus} onClick={() => setDialogOpen(true)} className="mt-6">
              {t("home.createFirstBox")}
            </AmberButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {boxes.map((box) => (
              <BoxCard key={box.id} box={box} isOwner={box.owner_id === user.id} onOpen={() => router.push(`/box/${box.id}`)} />
            ))}
            <button
              onClick={() => setDialogOpen(true)}
              className="rounded-md border border-dashed flex flex-col items-center justify-center gap-2 py-12 hover:brightness-125 transition"
              style={{ borderColor: pal.line, color: pal.creamDim }}
            >
              <Plus size={22} style={{ color: pal.amber }} />
              <span className="font-display text-sm">{t("home.createFirstBox")}</span>
            </button>
          </div>
        )}
      </div>
      <CreateBoxDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={user?.id}
        onCreated={(box) => setBoxes((prev) => [{ ...box, bandCount: 0, memberCount: 0 }, ...prev])}
      />
      <CompleteProfileDialog
        open={needsProfile}
        userId={user?.id}
        onCompleted={() => setNeedsProfile(false)}
      />
    </div>
  );
}
