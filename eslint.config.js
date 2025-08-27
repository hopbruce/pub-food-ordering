import eslint from "@eslint/js";
import next from "eslint-config-next";
export default [eslint.configs.recommended, ...next(), { ignores: ["**/node_modules/**","**/.next/**","**/dist/**"] }];
