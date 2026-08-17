import { HashRouter, Routes, Route } from "react-router-dom"
import TimedEllipticalMenu from "./TimedEllipticalMenu.jsx"
import ExhibitionsGallery from "./ExhibitionsGallery.jsx"
import CustomCursor from "./CustomCursor.jsx"

function Home() {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <TimedEllipticalMenu
                textColor="#FFFFFF"
                markerColor="#FFFFFF"
                fontSize={15}
                markerWidth={14}
            />
        </div>
    )
}

export default function App() {
    return (
        <HashRouter>
            <CustomCursor />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exhibitions" element={<ExhibitionsGallery />} />
                {/* Aggiungi qui /selected-works, /contact, /clouds man mano
                    che converti gli altri Code Component di Framer */}
            </Routes>
        </HashRouter>
    )
}
