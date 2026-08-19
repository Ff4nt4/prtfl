import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Il sito ora vive alla radice del dominio personalizzato
// (claudiamangone.com), non piu' sotto github.io/prtfl/, quindi il
// base path e' "/" invece di "/prtfl/". Se in futuro si smette di
// usare il dominio personalizzato e si torna a
// tuonomeutente.github.io/prtfl/, va rimesso su "/prtfl/".
export default defineConfig({
  plugins: [react()],
  base: "/",
})
