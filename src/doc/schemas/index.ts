import { authSchemas } from "./auth";
import { adminSchemas } from "./admin";

export const allSchemas = {
  ...authSchemas,
  ...adminSchemas,
};
