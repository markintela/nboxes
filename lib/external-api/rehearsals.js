import { TYPE_META, SCOPE_META, toMinutes } from "../theme";
import { ApiError } from "./errors";

export const ALLOWED_TYPES = Object.keys(TYPE_META);
export const ALLOWED_SCOPES = Object.keys(SCOPE_META);

function pad(n) {
  return String(n).padStart(2, "0");
}

export function serializeRehearsal(row) {
  return {
    id: row.id,
    box_id: row.box_id,
    band_id: row.band_id,
    name: row.name,
    type: row.type,
    day: row.day,
    month: row.month,
    year: row.year,
    date: `${row.year}-${pad(row.month + 1)}-${pad(row.day)}`,
    time: row.time,
    end_time: row.end_time,
    scope: row.scope,
    member_id: row.member_id,
    guest_name: row.guest_name,
    created_at: row.created_at,
  };
}

// Validates a create (partial: false) or patch (partial: true) payload.
// Mirrors the schedules table's check constraints and ScheduleDialog.jsx's
// per-scope required fields, so bad requests fail fast with a clear message
// instead of a raw Postgres error.
export function validatePayload(body, { partial } = { partial: false }) {
  const errors = [];
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k) && body[k] !== undefined && body[k] !== null && body[k] !== "";

  if (!partial || has("name")) {
    if (!has("name")) errors.push("'name' é obrigatório.");
  }
  if (!partial || has("type")) {
    if (!has("type")) errors.push("'type' é obrigatório.");
    else if (!ALLOWED_TYPES.includes(body.type)) errors.push(`'type' deve ser um de: ${ALLOWED_TYPES.join(", ")}.`);
  }
  if (!partial || has("day")) {
    if (!has("day") || !Number.isInteger(Number(body.day))) errors.push("'day' é obrigatório e deve ser um número.");
  }
  if (!partial || has("month")) {
    if (!has("month") || !Number.isInteger(Number(body.month))) errors.push("'month' é obrigatório e deve ser um número (0-11).");
  }
  if (!partial || has("year")) {
    if (!has("year") || !Number.isInteger(Number(body.year))) errors.push("'year' é obrigatório e deve ser um número.");
  }
  if (!partial || has("time")) {
    if (!has("time") || !/^\d{1,2}:\d{2}$/.test(body.time)) errors.push("'time' é obrigatório no formato HH:MM.");
  }
  if (has("end_time") && !/^\d{1,2}:\d{2}$/.test(body.end_time)) {
    errors.push("'end_time' deve estar no formato HH:MM.");
  }

  const scope = has("scope") ? body.scope : partial ? undefined : "banda";
  if (has("scope") && !ALLOWED_SCOPES.includes(body.scope)) {
    errors.push(`'scope' deve ser um de: ${ALLOWED_SCOPES.join(", ")}.`);
  }
  if (scope === "individual" && !has("member_id")) {
    errors.push("'member_id' é obrigatório quando scope='individual'.");
  }
  if (scope === "convidado" && !has("guest_name")) {
    errors.push("'guest_name' é obrigatório quando scope='convidado'.");
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Pedido inválido.", { errors });
  }
}

// Fetches same-day schedules in the box and returns any that overlap the
// given [time, end_time) window. No working-hours concept exists — a slot is
// simply available when nothing already booked overlaps it.
export async function findOverlap(admin, boxId, { day, month, year, time, end_time }, excludeId) {
  let query = admin
    .from("schedules")
    .select("*")
    .eq("box_id", boxId)
    .eq("day", Number(day))
    .eq("month", Number(month))
    .eq("year", Number(year));

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) throw new ApiError(500, `Falha ao verificar conflitos: ${error.message}`);

  const start = toMinutes(time);
  const end = end_time ? toMinutes(end_time) : start + 60;

  return (data || []).filter((row) => {
    const rowStart = toMinutes(row.time);
    const rowEnd = row.end_time ? toMinutes(row.end_time) : rowStart + 60;
    return start < rowEnd && rowStart < end;
  });
}
