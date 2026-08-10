"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { pal, MONTH_NAMES, WEEK_DAYS, monthMatrix } from "@/lib/theme";

export function DatePicker({ day, month, year, onChange }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState({ month, year });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    setCursor({ month, year });
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, month, year]);

  const cells = monthMatrix(cursor.year, cursor.month);

  const changeMonth = (delta) => {
    let m = cursor.month + delta;
    let y = cursor.year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCursor({ year: y, month: m });
  };

  const pick = (d) => {
    onChange({ day: d, month: cursor.month, year: cursor.year });
    setOpen(false);
  };

  const label = `${String(day).padStart(2, "0")} de ${MONTH_NAMES[month]?.toLowerCase()} de ${year}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center gap-2 rounded-sm border px-3 py-2 text-sm hover:brightness-125"
        style={{ background: pal.panel2, borderColor: pal.line, color: pal.cream }}
      >
        <CalendarDays size={14} style={{ color: pal.amber }} />
        {label}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-72 rounded-md border p-3 shadow-lg"
          style={{ background: pal.panel2, borderColor: pal.line }}
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-sm border hover:brightness-125" style={{ borderColor: pal.line, color: pal.cream }}>
              <ChevronLeft size={14} />
            </button>
            <span className="font-display font-semibold text-sm" style={{ color: pal.cream }}>
              {MONTH_NAMES[cursor.month]} <span style={{ color: pal.amber }}>{cursor.year}</span>
            </span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-sm border hover:brightness-125" style={{ borderColor: pal.line, color: pal.cream }}>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {WEEK_DAYS.map((d, i) => (
              <div key={i} className="font-mono text-[10px] text-center py-1" style={{ color: pal.brass }}>
                {d}
              </div>
            ))}
            {cells.map((d, idx) => {
              const isSelected = d === day && cursor.month === month && cursor.year === year;
              return (
                <button
                  type="button"
                  key={idx}
                  disabled={!d}
                  onClick={() => d && pick(d)}
                  className="aspect-square rounded-sm text-xs font-mono flex items-center justify-center hover:brightness-125 disabled:opacity-0"
                  style={{
                    background: isSelected ? pal.amber : "transparent",
                    color: isSelected ? "#241C0F" : pal.cream,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
