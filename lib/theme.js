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

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

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
