import ManagerEntity from "@/entities/Manager.entity";
import { validate } from "class-validator";
import { MyContext } from "..";
import AuthorizationService from "@/services/authorization.service";

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
  return;
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

// Vérifie si le rôle actuel peut gérer un utilisateur avec le rôle cible.
export function checkRoleInHierarchy(
  currentRole: string, 
  targetRole: string) {
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

//Check si le role est bien celui d'un super_admin ou d'un admin faisant parti du service en question
export const canAccessAuthorization = async (manager: MyContext["manager"], 
  targetServiceId: string, 
  authorizationService: AuthorizationService) => {
  assertAuthenticated(manager);
  const { role } = manager;
  if (role === "SUPER_ADMIN") return;
  const authorizations = await authorizationService.getByManager(manager.id);
  const hasAccess = authorizations.some(
    auth => auth.service.id === targetServiceId && auth.isActive
  );
  if (!hasAccess) {
    throw new Error(
      "Accès interdit : vous ne pouvez gérer que les autorisations de vos propres services."
    );
  }
};
