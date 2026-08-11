import { NextResponse } from "next/server";
import { requireApiKey } from "./auth";
import { ApiError } from "./errors";

// Wraps a Route Handler: checks the shared x-api-key header, then maps any
// ApiError thrown downstream to a JSON error response with the right status.
export function withApiKey(fn) {
  return async (request, ctx) => {
    try {
      requireApiKey(request);
      return await fn(request, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message, ...(err.details ? { details: err.details } : {}) }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Erro interno." }, { status: 500 });
    }
  };
}
