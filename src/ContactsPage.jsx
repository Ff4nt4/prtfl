import { useEffect, useState, startTransition } from "react"
import PageHeader from "./PageHeader.jsx"
import HoverGlowLink from "./HoverGlowLink.jsx"

// --- PAGINA CONTATTI ---
// A differenza di /exhibitions e /selected-works, questa e' una pagina
// bianca statica senza galleria a scorrimento: solo testo. Stesso header
// condiviso (PageHeader), stessa tipografia delle didascalie per il
// corpo del testo (font, colore, interlinea), ma disposizione diversa,
// in un normale flusso verticale che scorre con la pagina (le altre
// pagine invece bloccano lo scroll perche' e' la galleria orizzontale a
// gestire lo scorrimento).

const FONT_FAMILY = "Inter, Helvetica, Arial, sans-serif"
const COLOR_BLACK = "#000000"
const COLOR_WHITE = "#FFFFFF"

// Stesso identico stile delle didascalie di GalleryPage.jsx: font,
// colore, interlinea. Nessuna gerarchia interna (come richiesto per le
// didascalie della galleria) - qui si applica anche ai sotto-titoli
// ("Education", "Solo Exhibitions", "Residencies", ecc.), che restano
// nello stesso formato del resto del testo.
const captionTextStyle = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 12,
    lineHeight: 1.05,
    letterSpacing: "0.01em",
    fontWeight: 500,
    fontStyle: "normal",
    color: "rgba(0,0,0,0.7)",
    whiteSpace: "pre-line",
}

// Stesso stile/dimensione della voce centrale dell'header (es. "CONTACT"):
// usato per l'intestazione "ABOUT" a meta' pagina, come richiesto.
const sectionHeadingStyle = {
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    fontFamily: FONT_FAMILY,
    fontWeight: 500,
    fontSize: 18,
    color: COLOR_BLACK,
}

const ABOUT_TEXT = `Claudia Mangone (b.1996)
Lives and works between Bergamo and Milan

EDUCATION
2021 - 2023 Master in Visual Art, ÉCAL, Lausanne
2016 - 2021 Bachelor  in Visual Art,  Accademia di Belle Arti di Brera, Milan

SOLO EXHIBITIONS
2026 Culvert, riss(e), Varese
2026 Collyrium, Bacheca, Firenze
2023 Black’n’yellow Black’n’yellow, AnonimaKunsthalle, Varese

SELECTED GROUP EXHIBITIONS
2026 Magnolia, San Carpoforo, Milan
2025
- Ventaglio, Clima Gallery, Milan
- Mostrina, Palazzo Bronzo, Genoa
- Incandescenze e maree, YAG Garage, Pescara
2024 I Re non toccano le porte, Casa Scaglioni, Castelponzone
2022 Midsummer Night’s Dream, Notgalerie Skulpturenallee Seestadt, Vienna
2021 Pick Clique, Como Contemporanea, Como

RESIDENCIES
2026 ongoing Supertoscana at Centro Pecci and MudaC, Prato, Carrara
2025 Talents! Nuovo Grand Tour at Fondation Fiminco, Paris
2025 Culture Moves Europe with Fils Sous Filature, Paris
2024 Sentieri Creativi at Roncobello with GAMeC, Bergamo
2023 Parco d’arte ambientale di Torre Mammona, Assisi`

// Link cliccabili: stesso stile visivo del testo circostante (nessun
// blu/sottolineato "da browser"), coerente con l'estetica minimale del
// sito. L'email apre il client di posta, IG apre il profilo in una nuova
// scheda (e' un dominio esterno).
const captionLinkStyle = {
    color: "inherit",
    textDecoration: "none",
}

export default function ContactsPage() {
    const [isPhone, setIsPhone] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const onResize = () => {
            startTransition(() => {
                setIsPhone(window.innerWidth <= 768)
            })
        }
        onResize()
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    const horizontalGutter = isPhone ? 16 : 48
    const headerReserved = isPhone ? 72 : 100
    // Piccolo distacco in piu' dall'header, coerente con captionsExtraGap
    // usato in GalleryPage.jsx per lo stesso scopo.
    const topGap = isPhone ? 14 : 18
    // Spaziatura tra "email/IG", "ABOUT" e il testo lungo sotto.
    const blockGap = isPhone ? 28 : 36

    return (
        <main
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                background: COLOR_WHITE,
                color: COLOR_BLACK,
                // A differenza delle pagine con galleria (che bloccano lo
                // scroll e gestiscono loro lo scorrimento orizzontale),
                // qui il contenuto e' testo lungo in flusso normale: la
                // pagina scorre verticalmente come una pagina qualsiasi.
                overflowY: "auto",
            }}
        >
            <PageHeader centerLabel="CONTACT" />

            {/* Blocco di testo spostato dopo meta' pagina, allineato
                orizzontalmente con "CONTACT" nell'header (che e' centrato
                al 52%): stessa logica gia' usata per le didascalie in
                GalleryPage.jsx (left: 50vw). Resta nel flusso normale
                del documento (non fixed/absolute), quindi scorre insieme
                al resto della pagina. */}
            <div
                style={{
                    paddingTop: headerReserved + topGap,
                    marginLeft: "50vw",
                    width: `calc(50vw - ${horizontalGutter}px)`,
                    paddingRight: horizontalGutter,
                    paddingBottom: isPhone ? 60 : 80,
                    boxSizing: "border-box",
                }}
            >
                {/* Contatti: email e Instagram sono link cliccabili veri,
                    con lo stesso stile visivo del resto del testo. */}
                <div style={captionTextStyle}>
                    <div>
                        <HoverGlowLink
                            href="mailto:claudiamangone4@gmail.com"
                            baseColor="rgba(0,0,0,0.7)"
                            style={captionLinkStyle}
                        >
                            claudiamangone4@gmail.com
                        </HoverGlowLink>
                    </div>
                    <div>
                        IG{" "}
                        <HoverGlowLink
                            href="https://www.instagram.com/claudia_mangone_/"
                            target="_blank"
                            rel="noopener noreferrer"
                            baseColor="rgba(0,0,0,0.7)"
                            style={captionLinkStyle}
                        >
                            claudia_mangone_
                        </HoverGlowLink>
                    </div>
                </div>

                {/* "ABOUT": stessa dimensione/font di "CONTACT" nell'header */}
                <div style={{ ...sectionHeadingStyle, marginTop: blockGap }}>
                    About
                </div>

                {/* Bio, formazione, mostre, residenze: tutto in formato
                    didascalia, senza ulteriore gerarchia interna. */}
                <div style={{ ...captionTextStyle, marginTop: blockGap }}>
                    {ABOUT_TEXT}
                </div>
            </div>
        </main>
    )
}
