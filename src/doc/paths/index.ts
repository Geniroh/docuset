import { authPaths } from "./auth";
import { adminPaths } from "./admin";

export const allPaths = {
  ...authPaths,
  ...adminPaths,
};
