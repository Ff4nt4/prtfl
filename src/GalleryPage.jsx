import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"

import PageHeader from "./PageHeader.jsx"

// --- COMPONENTE GENERICO DI GALLERIA A SCORRIMENTO ---
// Estratto da ExhibitionsGallery.jsx: tutta l'impostazione (header,
// scroller orizzontale con drag/wheel, foto uniformi in altezza mai
// tagliate, didascalie ancorate dall'alto, footer) e' identica sia per
// /exhibitions sia per /selected-works. Cambiano solo i CONTENUTI
// (immagini + didascalie) e l'etichetta al centro dell'header.
//
// Uso:
//   <GalleryPage items={EXHIBITIONS} centerLabel="EXHIBITIONS" />
//   <GalleryPage items={SELECTED_WORKS} centerLabel="SELECTED WORKS" />
//
// Ogni "item" in items[] e':
//   { image: <url importata>, title: "Titolo (anno)", description: "..." }
// "description" e' opzionale: se assente o vuota, la didascalia mostra
// solo il titolo (utile per Selected Works, che ha solo titolo+anno).

const FONT_FAMILY = "Inter, Helvetica, Arial, sans-serif"
const COLOR_BLACK = "#000000"
const COLOR_WHITE = "#FFFFFF"

export default function GalleryPage({ items, centerLabel }) {
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
        // renderizzata cambia insieme all'altezza. Anche quando cambia
        // l'array items (pagina diversa), la prima immagine e' diversa.
    }, [measureFirstImage, galleryHeight, items])

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
        () => items[activeIndex] ?? items[0],
        [items, activeIndex]
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
                Componente condiviso: garantisce che "CLAUDIA MANGONE"
                resti nello stesso identico punto su ogni pagina secondaria. */}
            <PageHeader centerLabel={centerLabel} />

            {/* --- CONTENUTO PRINCIPALE ---
                La sezione non copre l'intera altezza della pagina: va dal
                fondo dell'intestazione fino all'inizio della fascia
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
                        // A riposo (scrollLeft 0), non e' il BORDO sinistro
                        // della prima foto a partire dal centro della
                        // pagina: e' il suo ASSE VERTICALE (centro) a
                        // coincidere esattamente con l'asse che divide la
                        // pagina in due (50vw). Per questo il padding
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
                        {items.map((item, index) => (
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
                Ancorate dall'ALTO (non dal basso): il blocco parte sempre
                alla stessa altezza fissa, quindi i titoli restano tutti
                allineati alla stessa quota indipendentemente da quante
                righe occupa la descrizione sotto (se presente).
                Allineate lateralmente sull'asse verticale centrale (50vw),
                lo stesso su cui si dispone la foto attiva/centrata.
                Nessuna gerarchia tra titolo e descrizione: stessa
                dimensione, stesso peso (medium), stesso grigio, stessa
                interlinea ridotta - un unico blocco di testo uniforme.
                Se "description" non e' presente (es. Selected Works, dove
                le didascalie sono solo titolo+anno), viene mostrato solo
                il titolo. --- */}
            <div
                style={{
                    position: "fixed",
                    left: "50vw",
                    top: `calc(100vh - ${bottomReservedHeight}px + ${captionsExtraGap}px)`,
                    width: `calc(50vw - ${horizontalGutter}px)`,
                    boxSizing: "border-box",
                    zIndex: 5,
                    userSelect: "none",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    fontSize: 12,
                    lineHeight: 1.05,
                    letterSpacing: "0.01em",
                    fontWeight: 500,
                    fontStyle: "normal",
                    color: "rgba(0,0,0,0.7)",
                }}
            >
                <div style={activeItem.description ? { marginBottom: 2 } : undefined}>
                    {activeItem.title}
                </div>
                {activeItem.description ? (
                    <div>{activeItem.description}</div>
                ) : null}
            </div>

            {/* --- FOOTER A DESTRA --- */}
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
                    CONTACT
                </a>
            </footer>
        </main>
    )
}
