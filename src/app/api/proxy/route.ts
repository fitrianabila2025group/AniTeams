import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "megacloud.blog",
  "megacloud.tv",
  "rapidcloud.live",
]);

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow any HTTPS URL - the CDN domains change frequently
    // We validate it's HTTPS and not a local/private address
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname;
    // Block local/private addresses
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.") ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isAllowedReferer(referer: string): boolean {
  try {
    const parsed = new URL(referer);
    return (
      parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const referer = request.nextUrl.searchParams.get("referer");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  if (referer && isAllowedReferer(referer)) {
    headers["Referer"] = referer;
    headers["Origin"] = new URL(referer).origin;
  }

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType =
      response.headers.get("content-type") ?? "application/octet-stream";
    const body = await response.arrayBuffer();

    // For m3u8 manifests, rewrite URLs to go through our proxy
    if (
      contentType.includes("mpegurl") ||
      contentType.includes("m3u8") ||
      url.endsWith(".m3u8")
    ) {
      let text = new TextDecoder().decode(body);
      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      const refParam = referer
        ? `&referer=${encodeURIComponent(referer)}`
        : "";

      // Rewrite URI= attributes in EXT tags
      text = text.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const fullUrl = uri.startsWith("http") ? uri : baseUrl + uri;
        return `URI="/api/proxy?url=${encodeURIComponent(fullUrl)}${refParam}"`;
      });

      // Rewrite all non-comment, non-empty lines (segment/manifest URLs)
      text = text.replace(/^(?!#)(\S+)$/gm, (line) => {
        const fullUrl = line.startsWith("http") ? line : baseUrl + line;
        return `/api/proxy?url=${encodeURIComponent(fullUrl)}${refParam}`;
      });

      return new NextResponse(text, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      });
    }

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 502 }
    );
  }
}
