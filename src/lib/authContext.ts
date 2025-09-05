import { Request, Response } from "express";
import { MyContext } from "..";
import Cookies from "cookies";
import { jwtVerify } from "jose";
import ManagerService from "../services/manager.service";
import ManagerEntity from "../entities/Manager.entity";
import loaders from "./dataLoaderContext";

export interface Payload {
  email: string;
  id: string;
}

export const authContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<MyContext> => {
  let manager: ManagerEntity | null = null;
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");
  if (token) {
    try {
      const verify = await jwtVerify<Payload>(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      manager = await new ManagerService().findManagerByEmail(
        verify.payload.email
      );
    } catch (err) {
      console.error("Erreur lors de la vérification du token :", err);
    }
  }
  return {
    req,
    res,
    manager,
    loaders
  };
};
