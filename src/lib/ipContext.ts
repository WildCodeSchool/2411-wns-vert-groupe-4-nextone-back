import { Request } from "express";
import os from 'os';

function getServerLocalIPv4() {
  const interfaces: any = os.networkInterfaces();
  let localIP = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        return localIP;
      }
    }
  }
  return localIP || '127.0.0.1'; 
}
console.log('IP locale du serveur :', getServerLocalIPv4());


export const ipContext = async ({ req }: { req: Request }) => {
  const ip =
  getServerLocalIPv4() ||
    (req.headers["x-forwarded-for"] as string | undefined) ||
    (req.socket.remoteAddress as string);
  return { ip };
};
