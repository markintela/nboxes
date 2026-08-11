import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withApiKey } from "@/lib/external-api/handler";
import { resolveBoxForEmail } from "@/lib/external-api/resolveBox";
import { ApiError } from "@/lib/external-api/errors";
import { serializeRehearsal, validatePayload, findOverlap } from "@/lib/external-api/rehearsals";

export const GET = withApiKey(async (request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const boxIdParam = searchParams.get("box_id") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const admin = createAdminClient();
  const { boxId } = await resolveBoxForEmail(admin, email, boxIdParam);

  const { data, error } = await admin.from("schedules").select("*").eq("box_id", boxId);
  if (error) throw new ApiError(500, `Falha ao consultar ensaios: ${error.message}`);

  let rows = data || [];
  if (from) rows = rows.filter((r) => `${r.year}-${String(r.month + 1).padStart(2, "0")}-${String(r.day).padStart(2, "0")}` >= from);
  if (to) rows = rows.filter((r) => `${r.year}-${String(r.month + 1).padStart(2, "0")}-${String(r.day).padStart(2, "0")}` <= to);

  return NextResponse.json({
    box: { id: boxId },
    rehearsals: rows.map(serializeRehearsal),
  });
});

export const POST = withApiKey(async (request) => {
  const body = await request.json();
  const { email, box_id: boxIdParam } = body;

  const admin = createAdminClient();
  const { boxId, bandId } = await resolveBoxForEmail(admin, email, boxIdParam);

  validatePayload(body, { partial: false });

  const scope = body.scope || "banda";
  const insertRow = {
    box_id: boxId,
    band_id: scope === "convidado" ? null : body.band_id || bandId,
    scope,
    member_id: scope === "individual" ? body.member_id : null,
    guest_name: scope === "convidado" ? body.guest_name : null,
    name: body.name,
    type: body.type,
    day: Number(body.day),
    month: Number(body.month),
    year: Number(body.year),
    time: body.time,
    end_time: body.end_time || null,
  };

  const conflicts = await findOverlap(admin, boxId, insertRow);
  if (conflicts.length > 0) {
    throw new ApiError(409, "Já existe um agendamento nesse horário.", {
      conflicts: conflicts.map(serializeRehearsal),
    });
  }

  const { data, error } = await admin.from("schedules").insert(insertRow).select().single();
  if (error) throw new ApiError(500, `Falha ao criar ensaio: ${error.message}`);

  return NextResponse.json(serializeRehearsal(data), { status: 201 });
});
