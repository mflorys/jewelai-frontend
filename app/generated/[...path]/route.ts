import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function proxyGenerated(
  req: NextRequest,
  context: { params: { path?: string[] } },
) {
  const targetPath = context.params.path?.join("/") ?? "";
  const url = new URL(`${BACKEND_URL}/generated/${targetPath}`);
  req.nextUrl.searchParams.forEach((value, key) =>
    url.searchParams.set(key, value),
  );

  const headers = new Headers(req.headers);
  headers.delete("host");

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      redirect: "manual",
      cache: "no-store",
    });

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");
    resHeaders.delete("transfer-encoding");

    const body = req.method === "HEAD" ? null : response.body;

    return new NextResponse(body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; cause?: unknown };
    console.error("[Generated Proxy Error]", {
      url: url.toString(),
      method: req.method,
      error: err?.message,
      code: err?.code,
      cause: err?.cause,
    });

    return new NextResponse("Failed to load generated asset", {
      status: 502,
    });
  }
}

export { proxyGenerated as GET, proxyGenerated as HEAD };

export const dynamic = "force-dynamic";
