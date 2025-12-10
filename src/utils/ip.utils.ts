import { Request } from "express";

export function getCleanClientIP(req: Request): string | null {
  const clientIP =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress;

  if (!clientIP) {
    return null;
  }

  return clientIP.replace(/^::ffff:/, "");
}
