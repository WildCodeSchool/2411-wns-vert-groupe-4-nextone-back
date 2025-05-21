import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";
import { resolvers as scalarResolvers } from "graphql-scalars";

const resolversArray = loadFilesSync(path.join(__dirname, "."), {
  extensions: [".resolver.ts"],
  recursive: true,
});

resolversArray.push(scalarResolvers);

export default mergeResolvers(resolversArray);