import GalleryPage from "./GalleryPage.jsx"

// Import locale delle immagini: Vite le impacchetta e genera l'URL
// corretto (con il path base "/prtfl/" incluso) al build. I link
// diretti a "github.com/.../blob/..." NON funzionano come <img src>
// perche' quella e' una pagina HTML di GitHub, non il file immagine.
import img1 from "./assets/imagesexhibitions/1.jpg"
import img2 from "./assets/imagesexhibitions/2.jpg"
import img3 from "./assets/imagesexhibitions/3.jpg"
import img4 from "./assets/imagesexhibitions/4.jpg"
import img5 from "./assets/imagesexhibitions/5.jpg"
import img6 from "./assets/imagesexhibitions/6.jpg"
import img7 from "./assets/imagesexhibitions/7.jpg"
import img8 from "./assets/imagesexhibitions/8.jpg"
import img9 from "./assets/imagesexhibitions/9.jpg"
import img10 from "./assets/imagesexhibitions/10.jpg"

// --- DATI DELLE MOSTRINE ---
const EXHIBITIONS = [
    {
        image: img1,
        title: "Culvert (2026)",
        description:
            "Solo exhibition curated by Simone S. Melis at Riss(e). Varese (IT)",
    },
    {
        image: img2,
        title: "Collyrium (2026)",
        description:
            "Solo exhibition at Bacheca. Florence (IT) - courtesy of the gallery. Ph: Lena Shaposhnikova",
    },
    {
        image: img3,
        title: "Ventaglio (2025)",
        description:
            "Group exhibition curated by Valerio Nicolai, at Clima Gallery. Milan (IT) - courtesy of the gallery. Ph: Flavio Pescatori",
    },
    {
        image: img4,
        title: "Mostrina (2025)",
        description:
            "Group exhibition curated by Marco A. Basso and Martina Montagna at Palazzo Bronzo. Genoa (IT) - courtesy of Palazzo Bronzo",
    },
    {
        image: img5,
        title: "Incandescenze e maree (2025)",
        description:
            "Group exhibition curated by Martina Cioffi, at YAG Garage. Pescara (IT) - courtesy of the gallery. Ph: Pierluigi Fabrizio",
    },
    {
        image: img6,
        title: "Talents! (2025)",
        description: "Open studio at Fondation Fiminco. Paris (FR)",
    },
    {
        image: img7,
        title: "Parco d’arte ambientale di Torre Mammona (2023–25)",
        description: "Opera site specific. Assisi (IT)",
    },
    {
        image: img8,
        title: "Black’n’yellow Black’n’yellow (2023)",
        description:
            "Solo exhibition curated by Cecilia Mentasti at AnonimaKunsthalle. Varese (IT)",
    },
    {
        image: img9,
        title: "I re non toccano le porte (2024)",
        description:
            "Group exhibition curated by Ermanno Cristini and Giancarlo Norese at Casa Scaglioni. Castelponzone (IT)",
    },
    {
        image: img10,
        title: "ECAL Talent Days (2023)",
        description:
            "Degree show of ÉCAL at ELAC Gallery. Renens, Lausanne (CH)",
    },
]

export default function ExhibitionsGallery() {
    return <GalleryPage items={EXHIBITIONS} centerLabel="EXHIBITIONS" />
}
