import { GraphQLError } from "graphql";
import { MyContext, ResolverWrapper } from "../";

export const checkCompanyIdMatch =
  (fieldPath: "id" | "data.id"): ResolverWrapper<any> =>
  (next) =>
  (root, args, context: MyContext, info) => {
    const pathParts = fieldPath.split(".");
    let targetId: string | undefined;

    if (pathParts.length === 1 && pathParts[0] in args) {
      targetId = args[pathParts[0]];
    } else if (
      pathParts.length === 2 &&
      args[pathParts[0]] &&
      pathParts[1] in args[pathParts[0]]
    ) {
      targetId = args[pathParts[0]][pathParts[1]];
    }

    if (!context.manager || targetId !== context.manager.companyId) {
      throw new GraphQLError("Forbidden.");
    }

    return next(root, args, context, info);
  };
