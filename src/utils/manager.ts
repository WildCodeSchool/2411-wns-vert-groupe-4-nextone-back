import ManagerEntity from "@/entities/Manager.entity";
import { validate } from "class-validator";

export function assertAuthenticated(manager: ManagerEntity | null): asserts manager is ManagerEntity {
  if (!manager) {
    throw new Error("Non autorisé : veuillez vous connecter.");
  }
}

export async function validateOrThrow(entity: object) {
  const errors = await validate(entity);
  if (errors.length > 0) {
    const messages = errors.flatMap(err => Object.values(err.constraints || {}));
    throw new Error(messages.join(" | "));
  }
}

export function checkAuthorization(currentRole: string | undefined, manager: ManagerEntity | null, targetRole?: string) {
    assertAuthenticated(manager)
    if (!currentRole) {
        throw new Error("Le rôle du manager est requis.");
    }
    const allowedCreators = ["SUPER_ADMIN", "ADMIN"];
    if (!allowedCreators.includes(currentRole)) {
        throw new Error("Non autorisé : seuls les superAdmin ou admin ont des droits sur les operators.");
    }
    if (!targetRole) {
        throw new Error("Le rôle est requis.");
    }
    const roleHierarchy = {
        SUPER_ADMIN: ["ADMIN", "OPERATOR"],
        ADMIN: ["OPERATOR"]
    };
    const allowedRoles = roleHierarchy[currentRole as keyof typeof roleHierarchy];
    if (!allowedRoles.includes(targetRole)) {
        throw new Error("Non autorisé : vous ne pouvez pas gérer un utilisateur avec ce rôle.");
    }
}