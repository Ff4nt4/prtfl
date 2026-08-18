import { HashRouter, Routes, Route, useNavigate } from "react-router-dom"
import { useEffect, startTransition } from "react"
import TimedEllipticalMenu from "./TimedEllipticalMenu.jsx"
import ExhibitionsGallery from "./ExhibitionsGallery.jsx"
import SelectedWorksGallery from "./SelectedWorksGallery.jsx"
import ContactsPage from "./ContactsPage.jsx"
import CustomCursor from "./CustomCursor.jsx"

// --- COMPONENTE HOME ---
function Home() {
    const menuConfig = {
        textColor: "#FF4F17",
        markerColor: "#FF4F17",
        fontSize: 18,
        markerWidth: 14,
    }

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            <TimedEllipticalMenu {...menuConfig} />
        </div>
    )
}

// --- COMPONENTE CHE INTERCETTA LA NAVIGAZIONE INTERNA ---
// I link nel menu ellittico e nella gallery sono tag <a> standard con
// href assoluti (es. "/exhibitions"). Va montato UNA SOLA VOLTA dentro
// HashRouter, fuori dalle <Routes>, cosi' resta attivo su TUTTE le
// pagine (non solo sulla Home) e intercetta sempre il click prima che
// il browser tenti un reload reale della pagina.
function NavigationInterceptor() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleInternalNavigation = (event) => {
            // Se un link ha gia' gestito da solo il proprio click (es. il
            // pulsante "DOWNLOAD PORTFOLIO", che chiama preventDefault()
            // per aprire un popup invece di navigare), non dobbiamo
            // interferire: altrimenti l'intercettore naviga comunque
            // verso l'href del link, smontando la pagina e chiudendo
            // il popup un istante dopo averlo aperto.
            if (event.defaultPrevented) return

            const target = event.target
            const anchor = target.closest("a")

            if (anchor) {
                const href = anchor.getAttribute("href")

                if (href && href.startsWith("/") && !anchor.hasAttribute("download")) {
                    event.preventDefault()
                    startTransition(() => {
                        navigate(href)
                    })
                }
            }
        }

        document.body.addEventListener("click", handleInternalNavigation)
        return () => {
            document.body.removeEventListener("click", handleInternalNavigation)
        }
    }, [navigate])

    return null
}

// --- COMPONENTE PRINCIPALE APP ---
export default function App() {
    return (
        // HashRouter e' l'ideale per il deploy statico gratuito (GitHub Pages, Netlify, etc.)
        <HashRouter>
            {/* Il Cursore Custom e' fuori dalle <Routes>, quindi resta sempre attivo
                mentre si naviga tra le pagine */}
            <CustomCursor />

            {/* Anche l'intercettore va fuori dalle <Routes>, cosi' funziona
                sia sulla Home sia su /exhibitions e le altre pagine future */}
            <NavigationInterceptor />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exhibitions" element={<ExhibitionsGallery />} />
                <Route path="/selected-works" element={<SelectedWorksGallery />} />
                <Route path="/contact" element={<ContactsPage />} />

                {/* Aggiungi qui /clouds quando converti anche quel
                    Code Component di Framer */}
            </Routes>
        </HashRouter>
    )
}
