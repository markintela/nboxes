import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withApiKey } from "@/lib/external-api/handler";
import { resolveBoxForEmail } from "@/lib/external-api/resolveBox";
import { ApiError } from "@/lib/external-api/errors";
import { serializeRehearsal, findOverlap } from "@/lib/external-api/rehearsals";

// No working-hours concept exists in this app — a slot is "available" simply
// when no schedules row overlaps it. This endpoint either returns the day's
// busy windows (for the caller to derive free time itself) or, if a
// candidate time/end_time is given, a direct available/conflicts answer.
export const GET = withApiKey(async (request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const boxIdParam = searchParams.get("box_id") || undefined;
  const date = searchParams.get("date");
  const time = searchParams.get("time") || undefined;
  const endTime = searchParams.get("end_time") || undefined;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, "Parâmetro 'date' é obrigatório no formato YYYY-MM-DD.");
  }
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);

  const admin = createAdminClient();
  const { boxId } = await resolveBoxForEmail(admin, email, boxIdParam);

  if (time) {
    const conflicts = await findOverlap(admin, boxId, { day, month, year, time, end_time: endTime });
    return NextResponse.json({
      date,
      time,
      end_time: endTime || null,
      available: conflicts.length === 0,
      conflicts: conflicts.map(serializeRehearsal),
    });
  }

  const { data, error } = await admin
    .from("schedules")
    .select("*")
    .eq("box_id", boxId)
    .eq("day", day)
    .eq("month", month)
    .eq("year", year);
  if (error) throw new ApiError(500, `Falha ao consultar disponibilidade: ${error.message}`);

  return NextResponse.json({
    date,
    busy: (data || []).map((r) => ({ time: r.time, end_time: r.end_time, name: r.name, type: r.type })),
  });
});
