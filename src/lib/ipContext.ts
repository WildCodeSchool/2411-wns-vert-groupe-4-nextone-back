import { Request } from "express";

export const ipContext = async ({ req }: { req: Request }) => {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined) ||
    (req.socket.remoteAddress as string);

  return { ip };
};
