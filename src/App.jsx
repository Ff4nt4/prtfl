import { HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useEffect, startTransition } from "react"
import TimedEllipticalMenu from "./TimedEllipticalMenu.jsx"
import ExhibitionsGallery from "./ExhibitionsGallery.jsx"
import CustomCursor from "./CustomCursor.jsx"

// --- COMPONENTE WRAPPER PER LA HOME ---
// Questo componente gestisce la logica di navigazione "silenziosa"
// necessaria per il menu ellittico animato.
function HomeWrapper() {
    const navigate = useNavigate()
    const location = useLocation()

    // Configurazione del menu recuperata dai Property Controls di Framer
    const menuConfig = {
        textColor: "#FFFFFF",
        markerColor: "#FFFFFF",
        fontSize: 15,
        markerWidth: 14,
    }

    // Effetto per intercettare i click sui link del menu ellittico.
    // In TimedEllipticalMenu.jsx, i link sono tag <a> standard.
    // Qui li "catturiamo" e usiamo la navigazione di React Router
    // per non ricaricare la pagina.
    useEffect(() => {
        // Funzione che gestisce il click
        const handleInternalNavigation = (event) => {
            const target = event.target
            // Cerca se il click è avvenuto dentro un tag <a>
            const anchor = target.closest("a")
            
            if (anchor) {
                const href = anchor.getAttribute("href")
                
                // Se il link è interno (inizia con /) e non è un download
                if (href && href.startsWith("/") && !anchor.hasAttribute("download")) {
                    // Impedisce il ricaricamento nativo della pagina
                    event.preventDefault()
                    
                    // Usa React Router per navigare internamente,
                    // avvolto in startTransition per performance
                    startTransition(() => {
                        navigate(href)
                    })
                }
            }
        }

        // Aggiunge il listener globale al body per intercettare tutti i click
        document.body.addEventListener("click", handleInternalNavigation)
        
        // Cleanup: rimuove il listener quando si esce dalla Home
        return () => {
            document.body.removeEventListener("click", handleInternalNavigation)
        }
    }, [navigate])

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            {/* Visualizza il menu ellittico */}
            <TimedEllipticalMenu {...menuConfig} />
        </div>
    )
}

// --- COMPONENTE PRINCIPALE APP ---
export default function App() {
    return (
        // Usiamo HashRouter perché è l'ideale per il deploy statico gratuito (GitHub Pages, Netlify, etc.)
        <HashRouter>
            {/* Il Cursore Custom è fuori dalle <Routes>, quindi resta sempre attivo
                mentre si naviga tra le pagine */}
            <CustomCursor />
            
            <Routes>
                {/* Quando l'URL è "/", mostriamo la HomeWrapper */}
                <Route path="/" element={<HomeWrapper />} />
                
                {/* Quando l'URL è "/exhibitions", mostriamo ExhibitionsGallery */}
                <Route path="/exhibitions" element={<ExhibitionsGallery />} />
                
                {/* Aggiungi qui /selected-works, /contact, /clouds man mano
                    che converti gli altri Code Component di Framer */}
            </Routes>
        </HashRouter>
    )
}
