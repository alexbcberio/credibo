import { Plugin } from "./Plugin";

interface Module extends Plugin {
  disabled?: boolean;
  description?: string;
  modules?: Array<Module>;
}

export { Module };
