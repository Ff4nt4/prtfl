import GalleryPage from "./GalleryPage.jsx"

// Placeholder numerati (1.jpg...10.jpg): sostituiscili con le foto vere
// degli stessi lavori, mantenendo ESATTAMENTE questi nomi di file dentro
// src/assets/imagesselectedworks/. Stesso identico procedimento gia'
// seguito per le immagini di /exhibitions.
import img1 from "./assets/imagesselectedworks/1.jpg"
import img2 from "./assets/imagesselectedworks/2.jpg"
import img3 from "./assets/imagesselectedworks/3.jpg"
import img4 from "./assets/imagesselectedworks/4.jpg"
import img5 from "./assets/imagesselectedworks/5.jpg"
import img6 from "./assets/imagesselectedworks/6.jpg"
import img7 from "./assets/imagesselectedworks/7.jpg"
import img8 from "./assets/imagesselectedworks/8.jpg"
import img9 from "./assets/imagesselectedworks/9.jpg"
import img10 from "./assets/imagesselectedworks/10.jpg"

// --- DATI DEI LAVORI ---
// Qui le didascalie sono solo titolo+anno (nessuna descrizione), quindi
// il campo "description" e' omesso: GalleryPage.jsx mostra automaticamente
// solo il titolo quando "description" non c'e'.
const SELECTED_WORKS = [
    { image: img1, title: "Conduttura (2026)" },
    { image: img2, title: "Pozzanghera (2026)" },
    { image: img3, title: "Colli (2026)" },
    { image: img4, title: "Ugly tear (2026)" },
    { image: img5, title: "Lil’ fly lying in the eye (2026)" },
    {
        image: img6,
        title: "Dire Dardo Scoccare lettera testamento (2025)",
    },
    { image: img7, title: "Pulsantiera (2026)" },
    { image: img8, title: "Fannnn (2022)" },
    { image: img9, title: "Previste precipitazioni (2023-25)" },
    { image: img10, title: "MB308 (2023)" },
]

export default function SelectedWorksGallery() {
    return <GalleryPage items={SELECTED_WORKS} centerLabel="SELECTED WORKS" />
}
