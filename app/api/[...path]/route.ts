import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function proxy(req: NextRequest, context: { params: { path: string[] } }) {
  const targetPath = context.params.path?.join("/") ?? "";
  const url = new URL(`${BACKEND_URL}/api/${targetPath}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const headers = new Headers(req.headers);
  headers.delete("host");

  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    const buffer = await req.arrayBuffer();
    body = buffer.byteLength ? buffer : undefined;
    if (!body) {
      headers.delete("content-length");
    }
  }

  const timeoutMs = 10 * 60 * 1000; // 10 minutes to match backend long-running calls

  const init: RequestInit = {
    method: req.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
    // Allow long-running image generation without proxy timeout
    signal: AbortSignal.timeout(timeoutMs),
  };

  try {
    const response = await fetch(url.toString(), init);
    const text = await response.text();

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-encoding");
    resHeaders.delete("transfer-encoding");

    return new NextResponse(text, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error("[API Proxy Error]", {
      url: url.toString(),
      method: req.method,
      error: err?.message,
      code: err?.code,
      cause: err?.cause,
      stack: err?.stack,
    });

    // Check if it's a connection error (backend not running)
    const isConnectionError = 
      err?.message?.includes("ECONNREFUSED") ||
      err?.message?.includes("fetch failed") ||
      err?.message?.includes("connect") ||
      err?.code === "ECONNREFUSED" ||
      err?.cause?.code === "ECONNREFUSED" ||
      err?.errno === "ECONNREFUSED";
    
    const message =
      err?.name === "TimeoutError"
        ? "Proxy timeout while waiting for backend"
        : isConnectionError
        ? `Cannot connect to backend at ${BACKEND_URL}. Make sure the backend server is running.`
        : err?.message || "Proxy error";
    const statusCode = err?.name === "TimeoutError" ? 504 : 502;
    return new NextResponse(
      JSON.stringify({ 
        error: message,
        backendUrl: url.toString(),
        details: isConnectionError 
          ? "The backend server appears to be down or unreachable. Please check that it's running on port 8080."
          : "Backend may be unreachable or returned an invalid response",
        originalError: process.env.NODE_ENV === "development" ? err?.message : undefined,
        errorType: err?.name || typeof err,
      }),
      {
        status: statusCode,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS, proxy as HEAD };

export const dynamic = "force-dynamic";
