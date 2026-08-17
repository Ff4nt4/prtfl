import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// IMPORTANTE: sostituisci "NOME-REPOSITORY" con il nome esatto del repository
// GitHub che creerai (es. se il repo si chiama "claudia-mangone-portfolio",
// scrivi "/claudia-mangone-portfolio/"). Deve avere le barre "/" sia
// all'inizio che alla fine.
export default defineConfig({
  plugins: [react()],
  base: "/prtfl/",
})
