import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withApiKey } from "@/lib/external-api/handler";
import { resolveBoxForEmail } from "@/lib/external-api/resolveBox";
import { ApiError } from "@/lib/external-api/errors";
import { serializeRehearsal, validatePayload, findOverlap } from "@/lib/external-api/rehearsals";

async function loadOwnedRow(admin, id, boxId) {
  const { data, error } = await admin.from("schedules").select("*").eq("id", id).single();
  if (error || !data) throw new ApiError(404, "Ensaio não encontrado.");
  if (data.box_id !== boxId) throw new ApiError(403, "Ensaio não pertence à box resolvida para este email.");
  return data;
}

export const PATCH = withApiKey(async (request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { email, box_id: boxIdParam } = body;

  const admin = createAdminClient();
  const { boxId } = await resolveBoxForEmail(admin, email, boxIdParam);
  const current = await loadOwnedRow(admin, id, boxId);

  validatePayload(body, { partial: true });

  const patch = {};
  for (const key of ["name", "type", "day", "month", "year", "time", "end_time", "scope", "band_id", "member_id", "guest_name"]) {
    if (Object.prototype.hasOwnProperty.call(body, key)) patch[key] = body[key];
  }
  if ("day" in patch) patch.day = Number(patch.day);
  if ("month" in patch) patch.month = Number(patch.month);
  if ("year" in patch) patch.year = Number(patch.year);

  const scope = patch.scope || current.scope;
  if (scope === "convidado") {
    patch.band_id = null;
    patch.member_id = patch.member_id ?? null;
  } else if (scope === "individual") {
    patch.guest_name = null;
  } else {
    patch.member_id = null;
    patch.guest_name = null;
  }

  const timeChanged = ["day", "month", "year", "time", "end_time"].some((k) => k in patch);
  if (timeChanged) {
    const merged = { ...current, ...patch };
    const conflicts = await findOverlap(admin, boxId, merged, id);
    if (conflicts.length > 0) {
      throw new ApiError(409, "Já existe um agendamento nesse horário.", {
        conflicts: conflicts.map(serializeRehearsal),
      });
    }
  }

  const { data, error } = await admin.from("schedules").update(patch).eq("id", id).select().single();
  if (error) throw new ApiError(500, `Falha ao editar ensaio: ${error.message}`);

  return NextResponse.json(serializeRehearsal(data));
});

export const DELETE = withApiKey(async (request, { params }) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const boxIdParam = searchParams.get("box_id") || undefined;

  const admin = createAdminClient();
  const { boxId } = await resolveBoxForEmail(admin, email, boxIdParam);
  await loadOwnedRow(admin, id, boxId);

  const { error } = await admin.from("schedules").delete().eq("id", id);
  if (error) throw new ApiError(500, `Falha ao apagar ensaio: ${error.message}`);

  return new NextResponse(null, { status: 204 });
});
