import crypto from "crypto";
import { SignJWT } from "jose";

export const createTokenAndExpiration = (minutes: number) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiration = new Date(Date.now() + minutes * 60 * 1000);
  return { token, expiration };
};

export const createInvitationToken = async (email: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const expiration = Date.now() + 24 * 60
  const token = await new SignJWT({email})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
  return { token, expiration }
};
