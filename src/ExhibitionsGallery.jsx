import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"

// Import locale delle immagini: Vite le impacchetta e genera l'URL
// corretto (con il path base "/prtfl/" incluso) al build. I link
// diretti a "github.com/.../blob/..." NON funzionano come <img src>
// perche' quella e' una pagina HTML di GitHub, non il file immagine.
import PageHeader from "./PageHeader.jsx"

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
        title: "Culvert (2026).",
        description:
            "SOLO EXHIBITION CURATED BY SIMONE S. MELIS AT RISS(E) - VARESE (IT)",
    },
    {
        image: img2,
        title: "Collyrium (2026)",
        description:
            "SOLO EXHIBITION AT BACHECA - FLORENCE (IT). COURTESY OF THE GALLERY - PH. LENA SHAPOSHNIKOVA",
    },
    {
        image: img3,
        title: "Ventaglio (2025)",
        description:
            "GROUP EXHIBITION CURATED BY VALERIO NICOLAI AT CLIMA GALLERY - MILANO (IT). COURTESY OF THE GALLERY - PH. FLAVIO PESCATORI",
    },
    {
        image: img4,
        title: "Mostrina (2025)",
        description:
            "GROUP EXHIBITION CURATED BY MARCO AUGUSTO BASSO AND MARTINA MONTAGNA AT PALAZZO BRONZO - GENOA (IT). COURTESY OF PALAZZO BRONZO",
    },
    {
        image: img5,
        title: "Incandescenze e maree (2025)",
        description:
            "GROUP EXHIBITION CURATED BY MARTINA CIOFFI AT YAG GARAGE - PESCARA (IT). COURTESY OF THE GALLERY - PH. PIERLUIGI FABRIZIO",
    },
    {
        image: img6,
        title: "Talents! (2025)",
        description: "OPEN STUDIO AT FONDATION FIMINCO - PARIS (FR).",
    },
    {
        image: img7,
        title: "Parco d’arte ambientale di Torre Mammona (2023–25)",
        description: "OPERA SITE SPECIFIC - ASSISI (IT)",
    },
    {
        image: img8,
        title: "Black’n’yellow Black’n’yellow (2023)",
        description:
            "SOLO EXHIBITION CURATED BY CECILIA MENTASTI AT ANONIMAKUNSTHALLE - VARESE (it)",
    },
    {
        image: img9,
        title: "I re non toccano le porte (2024)",
        description:
            "GROUP EXHIBITION CURATED BY ERMANNO CRISTINI AND GIANCARLO NORESE AT CASA SCAGLIONI - CASTELPONZONE (IT)",
    },
    {
        image: img10,
        title: "ECAL Talent Days (2023)",
        description:
            "DEGREE SHOW OF ÉCAL AT ELAC GALLERY - Renens, Lausanne (CH)",
    },
]

// --- CONFIGURAZIONE STILI ---
const FONT_FAMILY = "Inter, Helvetica, Arial, sans-serif"
const COLOR_BLACK = "#000000"
const COLOR_WHITE = "#FFFFFF"

export default function ExhibitionsGallery() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPhone, setIsPhone] = useState(false)
    // Larghezza (in px) della PRIMA foto, misurata a runtime: serve per
    // spostare il paddingLeft dello scroller in modo che sia il CENTRO
    // della prima foto (non il suo bordo sinistro) a coincidere con
    // l'asse verticale che divide in due la pagina (50vw). La larghezza
    // non e' fissa: dipende dalle proporzioni naturali della foto e
    // dall'altezza corrente (galleryHeight), quindi va misurata via JS.
    const [firstImageHalfWidth, setFirstImageHalfWidth] = useState(0)
    const scrollerRef = useRef(null)
    const firstImageRef = useRef(null)
    const itemRefs = useRef([])
    const dragStateRef = useRef({
        dragging: false,
        startX: 0,
        startScrollLeft: 0,
    })

    const gap = isPhone ? 12 : 28
    const horizontalGutter = isPhone ? 16 : 48
    // Gutter dedicato al footer (CONTACTS): distanza dal bordo destro
    // aumentata di poco rispetto al resto del layout della galleria.
    const footerEdgeGutter = isPhone ? 20 : 56
    const headerReserved = isPhone ? 72 : 100
    // Foto scalate del 40% in piu' rispetto a prima (54vh/51vh -> 75.6vh/71.4vh),
    // sempre alla stessa altezza tra loro. Stessa scala applicata anche al
    // limite di larghezza (maxWidth qui sotto sull'<img>) per le foto molto
    // panoramiche, cosi' la proporzione resta coerente.
    const galleryHeight = isPhone ? "75.6vh" : "71.4vh"
    // Spazio riservato in basso a didascalie + footer: serve per calcolare
    // la fascia verticale in cui vive la galleria (vedi "section" piu'
    // sotto), cosi' le foto si dispongono piu' in alto, centrate esattamente
    // a meta' tra il fondo dell'intestazione e l'inizio di questa fascia.
    const bottomReservedHeight = isPhone ? 90 : 110
    // Piccolo margine aggiuntivo SOLO per allontanare un po' le didascalie
    // dalle foto, senza toccare bottomReservedHeight (che definisce la
    // fascia della galleria, gia' corretta cosi' com'e').
    const captionsExtraGap = isPhone ? 14 : 18

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

    const measureFirstImage = useCallback(() => {
        if (!firstImageRef.current) return
        const width = firstImageRef.current.getBoundingClientRect().width
        startTransition(() => {
            setFirstImageHalfWidth(width / 2)
        })
    }, [])

    useEffect(() => {
        measureFirstImage()
        if (typeof window === "undefined") return
        window.addEventListener("resize", measureFirstImage)
        return () => window.removeEventListener("resize", measureFirstImage)
        // Rimisura anche quando cambia l'altezza della galleria (es. da
        // desktop a mobile), perche' a parita' di proporzioni la larghezza
        // renderizzata cambia insieme all'altezza.
    }, [measureFirstImage, galleryHeight])

    const updateCenteredItem = useCallback(() => {
        if (typeof window === "undefined") return
        if (!scrollerRef.current) return
        const scrollerRect = scrollerRef.current.getBoundingClientRect()
        const centerX = scrollerRect.left + scrollerRect.width / 2

        let closestIndex = 0
        let closestDistance = Number.POSITIVE_INFINITY
        itemRefs.current.forEach((node, index) => {
            if (!node) return
            const rect = node.getBoundingClientRect()
            const itemCenter = rect.left + rect.width / 2
            const distance = Math.abs(centerX - itemCenter)
            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = index
            }
        })

        startTransition(() => {
            setActiveIndex(closestIndex)
        })
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return
        const scroller = scrollerRef.current
        if (!scroller) return

        let rafId = 0
        const onScroll = () => {
            window.cancelAnimationFrame(rafId)
            rafId = window.requestAnimationFrame(updateCenteredItem)
        }

        scroller.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        onScroll()
        return () => {
            scroller.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            window.cancelAnimationFrame(rafId)
        }
    }, [updateCenteredItem])

    const onWheel = useCallback((event) => {
        if (!scrollerRef.current) return
        scrollerRef.current.scrollLeft += event.deltaY + event.deltaX
    }, [])

    const onPointerDown = useCallback((event) => {
        if (!scrollerRef.current) return
        dragStateRef.current.dragging = true
        dragStateRef.current.startX = event.clientX
        dragStateRef.current.startScrollLeft = scrollerRef.current.scrollLeft
        scrollerRef.current.setPointerCapture(event.pointerId)
    }, [])

    const onPointerMove = useCallback((event) => {
        if (!scrollerRef.current || !dragStateRef.current.dragging) return
        const delta = event.clientX - dragStateRef.current.startX
        scrollerRef.current.scrollLeft =
            dragStateRef.current.startScrollLeft - delta
    }, [])

    const onPointerUp = useCallback((event) => {
        if (!scrollerRef.current) return
        dragStateRef.current.dragging = false
        scrollerRef.current.releasePointerCapture(event.pointerId)
    }, [])

    const activeItem = useMemo(
        () => EXHIBITIONS[activeIndex] ?? EXHIBITIONS[0],
        [activeIndex]
    )

    const navLinkStyle = {
        textDecoration: "none",
        color: COLOR_BLACK,
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        fontSize: 18,
        cursor: "pointer",
        pointerEvents: "auto",
    }

    return (
        <main
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                background: COLOR_WHITE,
                overflow: "hidden",
                color: COLOR_BLACK,
            }}
        >
            {/* --- HEADER FISSO ---
                Ora e' il componente condiviso PageHeader: garantisce che
                "CLAUDIA MANGONE" resti nello stesso identico punto (stessa
                altezza dall'alto, stesso font-size) su questa e su tutte le
                future pagine secondarie (/selected-works, /contact, /clouds). */}
            <PageHeader centerLabel="EXHIBITIONS" />

            {/* --- CONTENUTO PRINCIPALE ---
                La sezione non copre piu' l'intera altezza della pagina:
                va dal fondo dell'intestazione fino all'inizio della fascia
                riservata a didascalie/footer (bottomReservedHeight). Le
                foto, centrate verticalmente al suo interno, risultano cosi'
                disposte esattamente sull'asse orizzontale che taglia a
                meta' lo spazio tra intestazione e didascalie - quindi
                piu' in alto rispetto a un centraggio sull'intera pagina. */}
            <section
                style={{
                    position: "absolute",
                    top: headerReserved,
                    left: 0,
                    right: 0,
                    height: `calc(100vh - ${headerReserved}px - ${bottomReservedHeight}px)`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    overflow: "visible",
                    zIndex: 1,
                }}
            >
                <div
                    ref={scrollerRef}
                    onWheel={onWheel}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    style={{
                        width: "100%",
                        overflowX: "auto",
                        overflowY: "hidden",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        touchAction: "pan-x",
                        cursor: dragStateRef.current.dragging
                            ? "grabbing"
                            : "grab",
                        // A riposo (scrollLeft 0), non e' piu' il BORDO
                        // sinistro della prima foto a partire dal centro
                        // della pagina: e' il suo ASSE VERTICALE (centro)
                        // a coincidere esattamente con l'asse che divide
                        // la pagina in due (50vw). Per questo il padding
                        // sottrae meta' della larghezza reale della prima
                        // foto, misurata via JS in measureFirstImage().
                        paddingLeft: `calc(50vw - ${firstImageHalfWidth}px)`,
                        paddingRight: horizontalGutter,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap,
                            minHeight: galleryHeight,
                            paddingRight: isPhone ? "25vw" : "35vw", 
                        }}
                    >
                        {EXHIBITIONS.map((item, index) => (
                            <div
                                key={`${item.title}-${index}`}
                                ref={(node) => {
                                    itemRefs.current[index] = node
                                }}
                                style={{
                                    height: galleryHeight,
                                    // Niente larghezza fissa: la larghezza
                                    // segue quella naturale della foto,
                                    // cosi' le proporzioni originali sono
                                    // sempre rispettate (mai tagliate).
                                    width: "auto",
                                    flex: "0 0 auto",
                                }}
                            >
                                <img
                                    ref={index === 0 ? firstImageRef : null}
                                    onLoad={
                                        index === 0
                                            ? measureFirstImage
                                            : undefined
                                    }
                                    src={item.image}
                                    alt={item.title}
                                    draggable={false}
                                    style={{
                                        height: "100%",
                                        width: "auto",
                                        // Limite di larghezza solo per le
                                        // foto molto panoramiche: objectFit
                                        // "contain" garantisce che l'intera
                                        // immagine resti visibile, senza
                                        // ritagli, anche quando scatta.
                                        // Scalato anch'esso del 40% insieme
                                        // all'altezza (42vw/72vw -> 58.8vw/100.8vw).
                                        maxWidth: isPhone
                                            ? "100.8vw"
                                            : "58.8vw",
                                        objectFit: "contain",
                                        userSelect: "none",
                                        display: "block",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DIDASCALIE ---
                Ancorate dall'ALTO (non piu' dal basso): il blocco parte
                sempre alla stessa altezza fissa, quindi i titoli restano
                tutti allineati alla stessa quota indipendentemente da
                quante righe occupa la descrizione sotto.
                Allineate lateralmente sull'asse verticale centrale (50vw),
                lo stesso su cui si dispone la foto attiva/centrata.
                Testo tornato al casing originale (maiuscole/minuscole
                come scritte in EXHIBITIONS, niente piu' lowercase forzato),
                sans-serif Helvetica, peso medium, 12px, interlinea piu'
                stretta, e un piccolo margine in piu' rispetto alle foto
                (captionsExtraGap) qui sopra. --- */}
            <div
                style={{
                    position: "fixed",
                    left: "50vw",
                    top: `calc(100vh - ${bottomReservedHeight}px + ${captionsExtraGap}px)`,
                    width: `calc(50vw - ${horizontalGutter}px)`,
                    boxSizing: "border-box",
                    zIndex: 5,
                    userSelect: "none",
                }}
            >
                <div
                    style={{
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontSize: 12,
                        lineHeight: 1.1,
                        letterSpacing: "0em",
                        fontWeight: 500,
                        fontStyle: "normal",
                        marginBottom: 4,
                    }}
                >
                    {activeItem.title}
                </div>
                <div
                    style={{
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontSize: 12,
                        lineHeight: 1.15,
                        letterSpacing: "0.01em",
                        fontWeight: 500,
                        fontStyle: "normal",
                        color: "rgba(0,0,0,0.7)",
                    }}
                >
                    {activeItem.description}
                </div>
            </div>

            {/* --- FOOTER A DESTRA ---
                Distanza dal bordo inferiore ridotta al minimo (allineamento
                in fondo con un piccolo padding, non piu' centrato in una
                fascia di 50/60px) e distanza dal bordo destro aumentata
                di poco tramite footerEdgeGutter. --- */}
            <footer
                style={{
                    position: "fixed",
                    bottom: 0,
                    right: 0,
                    width: "auto",
                    paddingRight: footerEdgeGutter,
                    paddingBottom: isPhone ? 10 : 12,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    boxSizing: "border-box",
                    zIndex: 10,
                }}
            >
                <a href="/contact" style={navLinkStyle}>
                    CONTACTS
                </a>
            </footer>
        </main>
    )
}
