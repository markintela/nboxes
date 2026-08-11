import { ApiError } from "./errors";

// The installed supabase-js admin API has no server-side email filter on
// listUsers (only page/perPage), so we page through users and match by email.
// Fine for the small number of accounts this app has.
async function findUserByEmail(admin, email) {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new ApiError(500, `Falha ao consultar utilizadores: ${error.message}`);

    const found = data.users.find((u) => (u.email || "").toLowerCase() === target);
    if (found) return found;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

// Resolves which box a given email should operate on, via
// auth.users(email) -> members.user_id -> members.band_id -> bands.box_id.
// romelochico@gmail.com is expected to be an invited member, not a box owner.
export async function resolveBoxForEmail(admin, email, boxId) {
  if (!email) throw new ApiError(400, "Parâmetro 'email' é obrigatório.");

  const user = await findUserByEmail(admin, email);
  if (!user) throw new ApiError(404, `Nenhuma conta encontrada para ${email}.`);

  const { data: memberships, error } = await admin
    .from("members")
    .select("id, band_id, bands(id, name, box_id, boxes(id, box_name))")
    .eq("user_id", user.id);

  if (error) throw new ApiError(500, `Falha ao consultar membros: ${error.message}`);
  if (!memberships || memberships.length === 0) {
    throw new ApiError(404, `${email} não é membro de nenhuma banda/box.`);
  }

  let candidates = memberships.filter((m) => m.bands && m.bands.box_id);

  if (boxId) {
    candidates = candidates.filter((m) => m.bands.box_id === boxId);
    if (candidates.length === 0) {
      throw new ApiError(404, `${email} não é membro de nenhuma banda na box ${boxId}.`);
    }
  }

  if (candidates.length > 1) {
    throw new ApiError(400, "Email pertence a mais do que uma box — especifique box_id.", {
      boxes: candidates.map((m) => ({ box_id: m.bands.box_id, box_name: m.bands.boxes?.box_name })),
    });
  }

  const membership = candidates[0];
  return {
    userId: user.id,
    memberId: membership.id,
    bandId: membership.band_id,
    boxId: membership.bands.box_id,
  };
}
