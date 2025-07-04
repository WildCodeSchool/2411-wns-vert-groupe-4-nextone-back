import ManagerEntity from "@/entities/Manager.entity";
import { validate } from "class-validator";

export async function validateOrThrow(entity: object) {
  const errors = await validate(entity);
  if (errors.length > 0) {
    const messages = errors.flatMap(err => Object.values(err.constraints || {}));
    throw new Error(messages.join(" | "));
  }
}

// Vérifie que le manager est bien authentifié (non nul).
export function assertAuthenticated(manager: ManagerEntity | null): asserts manager is ManagerEntity {
  if (!manager) {
    throw new Error("Non autorisé : veuillez vous connecter.");
  }
}

// Vérifie que le rôle actuel est strictement égal au rôle attendu.
export function checkStrictRole(currentRole: string | undefined, strictRole: string) {
  if (!currentRole) {
    throw new Error("Le rôle du manager est requis.");
  }
  if (currentRole !== strictRole) {
    throw new Error(`Non autorisé : seul le rôle ${strictRole} est autorisé.`);
  }
}

// Vérifie que le rôle actuel fait partie des rôles autorisés: "SUPER_ADMIN" et "ADMIN".
export function verifyCreatorPermission(currentRole: string) {
  const allowedCreators = ["SUPER_ADMIN", "ADMIN"];
  if (!allowedCreators.includes(currentRole)) {
    throw new Error(
      "Non autorisé : seuls les superAdmin ou admin ont des droits sur les operators."
    );
  }
}

// Vérifie que le rôle cible est bien fourni.
function assertRoleExists(role?: string) {
  if (!role) {
    throw new Error("Le rôle est requis.");
  }
}

// Vérifie si le rôle actuel peut gérer un utilisateur avec le rôle cible.
export function checkRoleInHierarchy(currentRole: string, targetRole: string) {
  const roleHierarchy: Record<string, string[]> = {
    SUPER_ADMIN: ["ADMIN", "OPERATOR"],
    ADMIN: ["OPERATOR"],
  };
  const allowedRoles = roleHierarchy[currentRole] || [];
  if (!allowedRoles.includes(targetRole)) {
    throw new Error(
      "Non autorisé : vous ne pouvez pas gérer un utilisateur avec ce rôle."
    );
  }
}

// Fonction principale de vérification des autorisations.
// 1. Vérifie que le manager est connecté.
// 2. Vérifie que son rôle est présent.
// 3. Si un rôle strict est exigé, le compare strictement.
// 4. Sinon, vérifie que le rôle est autorisé à créer des utilisateurs,
//    que le rôle cible est défini et conforme à la hiérarchie.
export function checkAuthorization(
  currentRole: string | undefined,
  manager: ManagerEntity | null,
  targetRole?: string,
  strictRole?: string
) {
  assertAuthenticated(manager);
  if (!currentRole) {
    throw new Error("Le rôle du manager est requis.");
  }
  if (strictRole) {
    checkStrictRole(currentRole, strictRole);
    return;
  }
  verifyCreatorPermission(currentRole);
  assertRoleExists(targetRole);
  checkRoleInHierarchy(currentRole, targetRole!);
}
