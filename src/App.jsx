import { HashRouter, Routes, Route, useNavigate } from "react-router-dom"
import { useEffect, startTransition } from "react"
import TimedEllipticalMenu from "./TimedEllipticalMenu.jsx"
import ExhibitionsGallery from "./ExhibitionsGallery.jsx"
import SelectedWorksGallery from "./SelectedWorksGallery.jsx"
import ContactsPage from "./ContactsPage.jsx"
import CustomCursor from "./CustomCursor.jsx"
import OrientationGuard from "./OrientationGuard.jsx"

// --- COMPONENTE HOME ---
function Home() {
    const menuConfig = {
        textColor: "#FFFFFF",
        markerColor: "#FFFFFF",
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
function NavigationInterceptor() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleInternalNavigation = (event) => {
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
        <OrientationGuard>
            <HashRouter>
                <CustomCursor />
                <NavigationInterceptor />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/exhibitions" element={<ExhibitionsGallery />} />
                    <Route path="/selected-works" element={<SelectedWorksGallery />} />
                    <Route path="/contact" element={<ContactsPage />} />
                </Routes>
            </HashRouter>
        </OrientationGuard>
    )
}
