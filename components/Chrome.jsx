import React from "react";
import { LogOut, ArrowLeft } from "lucide-react";
import { pal } from "@/lib/theme";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AmberButton({ children, onClick, className = "", type = "button", icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`font-display font-semibold text-sm tracking-wide px-4 py-2 rounded-sm flex items-center gap-2 hover:brightness-110 transition ${className}`}
      style={{ background: pal.amber, color: "#241C0F" }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`font-body text-sm px-4 py-2 rounded-sm border transition-colors ${className}`}
      style={{ borderColor: pal.line, color: pal.cream, background: "transparent", ...style }}
    >
      {children}
    </button>
  );
}

export function TicketDivider() {
  return (
    <div className="relative h-4 flex items-center my-2">
      <div className="w-full border-t border-dashed" style={{ borderColor: pal.line }} />
      <div className="absolute -left-4 w-4 h-4 rounded-full" style={{ background: pal.bg }} />
      <div className="absolute -right-4 w-4 h-4 rounded-full" style={{ background: pal.bg }} />
    </div>
  );
}

export function AppHeader({ user, onLogout, onBack, crumb }) {
  const { t } = useLanguage();
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || t("common.user");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-full flex items-center justify-between px-5 md:px-8 py-4 border-b sticky top-0 z-20"
      style={{ borderColor: pal.line, background: pal.bg }}
    >
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-sm border hover:brightness-125"
            style={{ borderColor: pal.line, color: pal.cream }}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <Logo size="text-lg" />
        {crumb && (
          <>
            <span className="font-mono text-sm" style={{ color: pal.brass }}>/</span>
            <span className="font-display text-sm" style={{ color: pal.creamDim }}>{crumb}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher className="hidden sm:inline-flex" />
        <Avatar className="h-8 w-8">
          <AvatarFallback style={{ background: pal.panel2, color: pal.amber }} className="font-display text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-body text-sm hidden sm:block" style={{ color: pal.cream }}>{displayName}</span>
        <button
          onClick={onLogout}
          className="p-1.5 rounded-sm border hover:brightness-125"
          style={{ borderColor: pal.line, color: pal.creamDim }}
          title={t("header.signOut")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
