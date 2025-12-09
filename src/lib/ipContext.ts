import { Request } from "express";
import os from "os";

export function getServerLocalIPv4() {
  const interfaces: any = os.networkInterfaces();
  let localIP = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIP = iface.address;
        return localIP;
      }
    }
  }
  return localIP;
}

export const ipContext = async ({ req }: { req: Request }) => {
  const ip =
    getServerLocalIPv4() ||
    (req.headers["x-forwarded-for"] as string | undefined) ||
    (req.socket.remoteAddress as string);
  const regex = /[0-9.]/g;
  const matched = ip.match(regex)?.join("");

  return { ip: matched.length < 15 ? "127.0.0.1" : matched };
};
