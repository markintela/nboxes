"use client";

import React, { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  pal, TYPE_META, SCOPE_META,
  monthMatrix, daysInMonth, addDays, addMonths, weekDates, layoutDayEvents,
} from "@/lib/theme";
import { AmberButton } from "@/components/Chrome";
import { ScheduleDialog } from "@/components/dialogs/ScheduleDialog";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const now = new Date();

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 23;
const HOUR_HEIGHT = 52;
const HOURS_RANGE = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
const TIMELINE_HEIGHT = HOURS_RANGE.length * HOUR_HEIGHT;

function sameDay(a, b) {
  return a.day === b.getDate() && a.month === b.getMonth() && a.year === b.getFullYear();
}

function whoFor(ev, bands, t) {
  if (ev.scope === "individual") return bands.flatMap((b) => b.members).find((m) => m.id === ev.member_id)?.name || "—";
  if (ev.scope === "convidado") return ev.guest_name || t("agenda.guestFallback");
  return bands.find((b) => b.id === ev.band_id)?.name || "—";
}

function pixelsForRange(startMin, endMin) {
  const offset = DAY_START_HOUR * 60;
  const totalMin = HOURS_RANGE.length * 60;
  const top = Math.max(0, Math.min(totalMin, startMin - offset));
  const bottom = Math.max(0, Math.min(totalMin, endMin - offset));
  const pxPerMin = HOUR_HEIGHT / 60;
  return { top: top * pxPerMin, height: Math.max(20, (bottom - top) * pxPerMin) };
}

function ViewSwitcher({ view, onChange }) {
  const { t } = useLanguage();
  const views = [
    { key: "dia", label: t("agenda.viewDay") },
    { key: "semana", label: t("agenda.viewWeek") },
    { key: "mes", label: t("agenda.viewMonth") },
    { key: "trimestre", label: t("agenda.viewQuarter") },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-md border p-1" style={{ borderColor: pal.line, background: pal.panel }}>
      {views.map((v) => (
        <button
          key={v.key}
          type="button"
          onClick={() => onChange(v.key)}
          className="font-display font-semibold text-xs tracking-wide rounded-sm px-3 py-1.5 transition-colors"
          style={{
            background: view === v.key ? pal.amber : "transparent",
            color: view === v.key ? "#241C0F" : pal.creamDim,
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function EventBlock({ ev, bands, style }) {
  const { t } = useLanguage();
  const meta = TYPE_META[ev.type] || TYPE_META.Outros;
  const Icon = meta.icon;
  const scopeMeta = SCOPE_META[ev.scope] || SCOPE_META.banda;
  const ScopeIcon = scopeMeta.icon;
  const who = whoFor(ev, bands, t);
  const scopeLabel = t(`enums.scope.${ev.scope}`);
  const timeRange = ev.end_time ? `${ev.time}–${ev.end_time}` : ev.time;

  return (
    <div
      className="absolute rounded-sm px-1.5 py-1 overflow-hidden border-l-2"
      style={{ background: meta.soft, borderColor: meta.color, ...style }}
      title={`${ev.name} · ${scopeLabel}: ${who} · ${timeRange}`}
    >
      <div className="flex items-center gap-1">
        <Icon size={10} style={{ color: meta.color, flexShrink: 0 }} />
        <span className="font-mono text-[10px] font-semibold truncate" style={{ color: meta.color }}>{timeRange}</span>
      </div>
      <div className="font-body text-[11px] truncate" style={{ color: pal.cream }}>{ev.name}</div>
      <span
        className="inline-flex items-center gap-1 rounded-sm px-1 py-[1px] mt-0.5 font-mono text-[9px] truncate font-semibold"
        style={{ background: scopeMeta.soft, color: scopeMeta.color }}
      >
        <ScopeIcon size={9} /> {who}
      </span>
    </div>
  );
}

/* ------------------------------ DAY / WEEK ------------------------------ */
function DayWeekView({ days, schedule, bands, onSlotClick }) {
  const eventsByDay = days.map((d) => schedule.filter((s) => s.day === d.day && s.month === d.month && s.year === d.year));
  const minWidth = 56 + days.length * (days.length === 1 ? 280 : 120);

  return (
    <div className="overflow-x-auto">
      <div className="overflow-y-auto" style={{ maxHeight: "65vh", minWidth }}>
        <div className="flex border rounded-md overflow-hidden" style={{ borderColor: pal.line }}>
          <div className="flex flex-col shrink-0" style={{ width: 56 }}>
            <div className="h-12 border-b sticky top-0 z-10" style={{ borderColor: pal.line, background: pal.panel }} />
            {HOURS_RANGE.map((h) => (
              <div
                key={h}
                className="border-b flex items-start justify-end pr-2 pt-1 font-mono text-[10px]"
                style={{ height: HOUR_HEIGHT, borderColor: pal.lineSoft, color: pal.brass, background: pal.panel }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
            {days.map((d, di) => {
              const placed = layoutDayEvents(eventsByDay[di]);
              return (
                <div key={di} className="relative border-l" style={{ borderColor: pal.line }}>
                  <div
                    className="h-12 border-b sticky top-0 z-10 flex flex-col items-center justify-center"
                    style={{ borderColor: pal.line, background: d.isToday ? pal.amberSoft : pal.panel2 }}
                  >
                    <span className="font-mono text-[10px]" style={{ color: pal.creamDim }}>{d.label}</span>
                    <span className="font-display text-sm font-bold" style={{ color: d.isToday ? pal.amber : pal.cream }}>
                      {String(d.day).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="relative" style={{ height: TIMELINE_HEIGHT }}>
                    {HOURS_RANGE.map((h, hi) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => onSlotClick(d, h)}
                        className="absolute left-0 right-0 border-b hover:brightness-110"
                        style={{ top: hi * HOUR_HEIGHT, height: HOUR_HEIGHT, borderColor: pal.lineSoft, background: "transparent" }}
                      />
                    ))}
                    {placed.map(({ ev, start, end, col, cols }) => {
                      const px = pixelsForRange(start, end);
                      const widthPct = 100 / cols;
                      return (
                        <EventBlock
                          key={ev.id}
                          ev={ev}
                          bands={bands}
                          style={{
                            top: px.top,
                            height: px.height,
                            left: `calc(${col * widthPct}% + 2px)`,
                            width: `calc(${widthPct}% - 4px)`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- MÊS ---------------------------------- */
function MonthView({ refDate, schedule, bands, weekdaysShort, onDayClick }) {
  const { t } = useLanguage();
  const cells = useMemo(() => monthMatrix(refDate.year, refDate.month), [refDate.year, refDate.month]);
  const eventsForMonth = schedule.filter((s) => s.month === refDate.month && s.year === refDate.year);

  return (
    <div className="grid grid-cols-7 border-t border-l flex-1" style={{ borderColor: pal.line }}>
      {weekdaysShort.map((d, i) => (
        <div key={i} className="font-mono text-[11px] text-center py-2 border-r border-b" style={{ borderColor: pal.line, color: pal.brass, background: pal.panel }}>
          {d}
        </div>
      ))}
      {cells.map((day, idx) => {
        const events = day ? eventsForMonth.filter((s) => s.day === day) : [];
        const isToday = day && sameDay({ year: refDate.year, month: refDate.month, day }, now);
        return (
          <div
            key={idx}
            onClick={() => day && onDayClick({ year: refDate.year, month: refDate.month, day })}
            className="border-r border-b p-1.5 flex flex-col gap-1 min-h-[92px] md:min-h-[120px]"
            style={{ borderColor: pal.line, background: day ? (isToday ? pal.amberSoft : pal.bg) : pal.lineSoft, cursor: day ? "pointer" : "default" }}
          >
            {day && (
              <>
                <span className="font-mono text-xs" style={{ color: isToday ? pal.amber : pal.creamDim }}>
                  {String(day).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {events.slice(0, 3).map((ev) => {
                    const meta = TYPE_META[ev.type] || TYPE_META.Outros;
                    const Icon = meta.icon;
                    const scopeMeta = SCOPE_META[ev.scope] || SCOPE_META.banda;
                    const ScopeIcon = scopeMeta.icon;
                    const who = whoFor(ev, bands, t);
                    const scopeLabel = t(`enums.scope.${ev.scope}`);
                    const timeRange = ev.end_time ? `${ev.time}–${ev.end_time}` : ev.time;
                    return (
                      <div
                        key={ev.id}
                        className="rounded-sm px-1.5 py-0.5 overflow-hidden"
                        style={{ background: meta.soft }}
                        title={`${ev.name} · ${scopeLabel}: ${who} · ${timeRange}`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon size={10} style={{ color: meta.color, flexShrink: 0 }} />
                          <span className="font-mono text-[10px] truncate flex-1" style={{ color: meta.color }}>{timeRange} {ev.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className="flex items-center gap-1 rounded-sm px-1 py-[1px] font-mono text-[9px] truncate font-semibold"
                            style={{ background: scopeMeta.soft, color: scopeMeta.color }}
                          >
                            <ScopeIcon size={9} style={{ flexShrink: 0 }} /> {who}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {events.length > 3 && (
                    <span className="font-mono text-[9px]" style={{ color: pal.creamDim }}>{t("agenda.moreEvents", { count: events.length - 3 })}</span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ TRIMESTRE -------------------------------- */
function MiniMonth({ year, month, schedule, monthName, weekdaysShort, onDayClick }) {
  const cells = monthMatrix(year, month);

  return (
    <div className="rounded-md border overflow-hidden" style={{ borderColor: pal.line }}>
      <div className="px-3 py-2 font-display font-semibold text-sm text-center" style={{ background: pal.panel2, color: pal.amber }}>
        {monthName}
      </div>
      <div className="grid grid-cols-7">
        {weekdaysShort.map((d, i) => (
          <div key={i} className="font-mono text-[9px] text-center py-1" style={{ color: pal.brass }}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          const events = day ? schedule.filter((s) => s.day === day && s.month === month && s.year === year) : [];
          const isToday = day && sameDay({ year, month, day }, now);
          return (
            <button
              type="button"
              key={idx}
              disabled={!day}
              onClick={() => day && onDayClick({ year, month, day })}
              className="aspect-square flex flex-col items-center justify-center gap-0.5 hover:brightness-125 disabled:opacity-0 border-t"
              style={{ borderColor: pal.lineSoft, background: isToday ? pal.amberSoft : "transparent" }}
            >
              <span className="font-mono text-[10px]" style={{ color: isToday ? pal.amber : pal.creamDim }}>{day}</span>
              {events.length > 0 && (
                <span className="flex gap-0.5">
                  {events.slice(0, 3).map((ev) => (
                    <span key={ev.id} className="w-1 h-1 rounded-full" style={{ background: (TYPE_META[ev.type] || TYPE_META.Outros).color }} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuarterView({ refDate, schedule, months, weekdaysShort, onDayClick }) {
  const qStartMonth = Math.floor(refDate.month / 3) * 3;
  const qMonths = [0, 1, 2].map((i) => qStartMonth + i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
      {qMonths.map((m) => (
        <MiniMonth key={m} year={refDate.year} month={m} schedule={schedule} monthName={months[m]} weekdaysShort={weekdaysShort} onDayClick={onDayClick} />
      ))}
    </div>
  );
}

/* ------------------------------ AGENDA TAB ------------------------------- */
export function AgendaTab({ box, bands, schedule, setSchedule }) {
  const { t } = useLanguage();
  const months = t("calendar.months");
  const weekdaysShort = t("calendar.weekdaysShort");
  const weekdaysLong = t("calendar.weekdaysLong");

  const [view, setView] = useState("mes");
  const [refDate, setRefDate] = useState({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(refDate);
  const [dialogHour, setDialogHour] = useState(undefined);

  const openDialog = (date, hour) => {
    setDialogDate(date);
    setDialogHour(hour !== undefined ? String(hour).padStart(2, "0") : undefined);
    setDialogOpen(true);
  };

  const navigate = (delta) => {
    if (view === "dia") setRefDate(addDays(refDate.year, refDate.month, refDate.day, delta));
    else if (view === "semana") setRefDate(addDays(refDate.year, refDate.month, refDate.day, delta * 7));
    else if (view === "mes") {
      const { year, month } = addMonths(refDate.year, refDate.month, delta);
      setRefDate({ year, month, day: Math.min(refDate.day, daysInMonth(year, month)) });
    } else {
      const { year, month } = addMonths(refDate.year, refDate.month, delta * 3);
      setRefDate({ year, month, day: 1 });
    }
  };

  const goToday = () => setRefDate({ year: now.getFullYear(), month: now.getMonth(), day: now.getDate() });

  const periodLabel = useMemo(() => {
    if (view === "dia") {
      const weekday = weekdaysLong[new Date(refDate.year, refDate.month, refDate.day).getDay()];
      return t("agenda.dayLabel", { weekday, day: refDate.day, month: months[refDate.month], year: refDate.year });
    }
    if (view === "semana") {
      const days = weekDates(refDate.year, refDate.month, refDate.day);
      const first = days[0];
      const last = days[6];
      if (first.month === last.month) {
        return t("agenda.weekLabelSameMonth", { startDay: first.day, endDay: last.day, month: months[first.month], year: first.year });
      }
      return t("agenda.weekLabelCrossMonth", {
        startDay: first.day, startMonth: months[first.month],
        endDay: last.day, endMonth: months[last.month], year: last.year,
      });
    }
    if (view === "trimestre") {
      const qStartMonth = Math.floor(refDate.month / 3) * 3;
      return t("agenda.quarterLabel", { startMonth: months[qStartMonth], endMonth: months[qStartMonth + 2], year: refDate.year });
    }
    return t("agenda.monthLabel", { month: months[refDate.month], year: refDate.year });
  }, [view, refDate, months, weekdaysLong, t]);

  return (
    <div className="flex flex-col" style={{ minHeight: "70vh" }}>
      <div className="flex items-center justify-between px-1 py-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-sm border hover:brightness-125" style={{ borderColor: pal.line, color: pal.cream }}>
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-display font-bold text-lg md:text-2xl" style={{ color: pal.cream }}>
            {periodLabel}
          </h2>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-sm border hover:brightness-125" style={{ borderColor: pal.line, color: pal.cream }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={goToday} className="font-mono text-[11px] px-2 py-1 rounded-sm border hover:brightness-125" style={{ borderColor: pal.line, color: pal.brass }}>
            {t("agenda.today")}
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ViewSwitcher view={view} onChange={setView} />
          <AmberButton icon={Plus} onClick={() => openDialog(refDate)}>{t("agenda.schedule")}</AmberButton>
        </div>
      </div>

      {view === "mes" && (
        <MonthView refDate={refDate} schedule={schedule} bands={bands} weekdaysShort={weekdaysShort} onDayClick={(d) => openDialog(d)} />
      )}
      {view === "trimestre" && (
        <QuarterView refDate={refDate} schedule={schedule} months={months} weekdaysShort={weekdaysShort} onDayClick={(d) => { setRefDate(d); setView("dia"); }} />
      )}
      {view === "dia" && (
        <DayWeekView
          days={[{
            ...refDate,
            label: weekdaysLong[new Date(refDate.year, refDate.month, refDate.day).getDay()].slice(0, 3),
            isToday: sameDay(refDate, now),
          }]}
          schedule={schedule}
          bands={bands}
          onSlotClick={(d, h) => openDialog(d, h)}
        />
      )}
      {view === "semana" && (
        <DayWeekView
          days={weekDates(refDate.year, refDate.month, refDate.day).map((d) => ({
            ...d,
            label: weekdaysShort[new Date(d.year, d.month, d.day).getDay()],
            isToday: sameDay(d, now),
          }))}
          schedule={schedule}
          bands={bands}
          onSlotClick={(d, h) => openDialog(d, h)}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 mt-4 px-1">
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: pal.creamDim }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} /> {t(`enums.type.${key}`)}
          </span>
        ))}
        <span className="w-px h-3" style={{ background: pal.line }} />
        {Object.entries(SCOPE_META).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <span key={key} className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: meta.color }}>
              <Icon size={11} /> {t(`enums.scope.${key}`)}
            </span>
          );
        })}
      </div>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        box={box}
        bands={bands}
        defaultDate={dialogDate}
        defaultStartHour={dialogHour}
        onCreated={(item) => setSchedule((prev) => [...prev, item])}
      />
    </div>
  );
}
