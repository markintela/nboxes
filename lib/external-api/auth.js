import { timingSafeEqual } from "crypto";
import { ApiError } from "./errors";

export function requireApiKey(request) {
  const provided = request.headers.get("x-api-key");
  const expected = process.env.REHEARSALS_API_KEY;

  if (!expected) {
    throw new ApiError(500, "REHEARSALS_API_KEY não está configurada no servidor.");
  }
  if (!provided) {
    throw new ApiError(401, "Cabeçalho x-api-key em falta.");
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && timingSafeEqual(a, b);
  if (!valid) {
    throw new ApiError(401, "x-api-key inválida.");
  }
}
