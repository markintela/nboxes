import { Guitar, Disc3, Wrench, Sparkles, Droplet, Zap, Wifi, DollarSign, User, UserPlus } from "lucide-react";

export const pal = {
  bg: "#0B0A08",
  panel: "#161310",
  panel2: "#1E1A15",
  panel3: "#26201A",
  line: "#37301F",
  lineSoft: "#241F17",
  amber: "#E3A857",
  amberDim: "#B9863F",
  amberSoft: "rgba(227,168,87,0.14)",
  red: "#B4433A",
  redSoft: "rgba(180,67,58,0.16)",
  cream: "#EFE6D3",
  creamDim: "#A79C86",
  brass: "#8C7B5D",
  teal: "#5C8A78",
  tealSoft: "rgba(92,138,120,0.16)",
};

export const TYPE_META = {
  Ensaio: { color: pal.amber, soft: pal.amberSoft, icon: Guitar },
  "Gravação": { color: pal.teal, soft: pal.tealSoft, icon: Disc3 },
  Ajuste: { color: pal.red, soft: pal.redSoft, icon: Wrench },
  Outros: { color: pal.brass, soft: "rgba(140,123,93,0.16)", icon: Sparkles },
};

export const SCOPE_META = {
  banda: { label: "Banda", color: pal.teal, soft: pal.tealSoft, icon: Guitar },
  individual: { label: "Individual", color: pal.amber, soft: pal.amberSoft, icon: User },
  convidado: { label: "Convidado", color: pal.red, soft: pal.redSoft, icon: UserPlus },
};

export const EXP_META = {
  "Água": { icon: Droplet, color: pal.teal },
  Luz: { icon: Zap, color: pal.amber },
  Internet: { icon: Wifi, color: pal.brass },
  Outro: { icon: DollarSign, color: pal.red },
};

export function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function addDays(year, month, day, delta) {
  const d = new Date(year, month, day + delta);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

export function addMonths(year, month, delta) {
  let m = month + delta;
  let y = year;
  while (m < 0) { m += 12; y -= 1; }
  while (m > 11) { m -= 12; y += 1; }
  return { year: y, month: m };
}

export function weekDates(year, month, day) {
  const base = new Date(year, month, day);
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  });
}

export function toMinutes(time) {
  const [h, m] = (time || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function layoutDayEvents(events) {
  const sorted = [...events].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
  const columnEnds = [];
  const placed = sorted.map((ev) => {
    const start = toMinutes(ev.time);
    const end = ev.end_time ? toMinutes(ev.end_time) : start + 60;
    let col = columnEnds.findIndex((endMin) => endMin <= start);
    if (col === -1) { col = columnEnds.length; columnEnds.push(end); }
    else columnEnds[col] = end;
    return { ev, start, end, col };
  });
  const cols = Math.max(1, columnEnds.length);
  return placed.map((p) => ({ ...p, cols }));
}

export function computeSplit(box, expenses, bands) {
  const totalExpense = expenses.reduce((s, e) => s + Number(e.valor || 0), 0);
  const bandCount = bands.length || 1;
  const memberCount = bands.reduce((s, b) => s + b.members.length, 0) || 1;

  const bandTotals = bands.map((band) => {
    let total;
    if (box.split_method === "banda") {
      total = totalExpense / bandCount;
    } else {
      total = (totalExpense / memberCount) * band.members.length;
    }
    const perMember = band.members.length ? total / band.members.length : 0;
    return { bandId: band.id, name: band.name, total, perMember, members: band.members };
  });

  return { totalExpense, bandCount, memberCount, bandTotals };
}

export function fmtBRL(v) {
  return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
