import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: cambiá "album-tracker" por el nombre EXACTO de tu repositorio
// de GitHub. Si tu repo se llama "mis-figus", esto debe ser "/mis-figus/".
// Si vas a usar un dominio propio o solo correrlo local, podés dejar "/".
const REPO_NAME = "CollectionTracker";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? `/${REPO_NAME}/` : "/",
});
