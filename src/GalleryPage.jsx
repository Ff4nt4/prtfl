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
    // Larghezza fissa delle foto SOLO su smartphone: la galleria li'
    // scorre in verticale (dall'alto verso il basso) invece che in
    // orizzontale come su desktop, quindi qui e' la larghezza ad essere
    // fissa (piena larghezza pagina meno i margini laterali) e l'altezza
    // a seguire liberamente le proporzioni naturali di ogni foto.
    const photoWidthPhone = `calc(100vw - ${horizontalGutter * 2}px)`
    // Gutter dedicato al footer (CONTACTS): distanza dal bordo destro
    // aumentata di poco rispetto al resto del layout della galleria.
    const footerEdgeGutter = isPhone ? 20 : 56
    const headerReserved = isPhone ? 72 : 100
    // Spazio riservato in basso a didascalie + footer: ridotto rispetto a
    // prima (90/110 -> 64/84) per lasciare piu' spazio verticale alle
    // foto, come richiesto. Questo valore, insieme a headerReserved,
    // definisce ESATTAMENTE la fascia verticale disponibile per la
    // galleria (vedi "section" e galleryHeight qui sotto): tra i due non
    // deve mai restare un residuo superiore al 50% dell'altezza pagina,
    // cosi' le foto occupano sempre almeno meta' dell'altezza.
    const bottomReservedHeight = isPhone ? 64 : 84
    // Spazio bianco aggiuntivo SOLO su smartphone, tra il FONDO delle
    // foto e le didascalie sotto (non tra header e foto): riduce di
    // conseguenza l'altezza della galleria dal basso, cosi' le foto
    // finiscono un po' prima e lasciano un margine visibile prima del
    // testo della didascalia.
    const galleryBottomGapPhone = isPhone ? 18 : 0
    // FONDAMENTALE: l'altezza delle foto ora e' calcolata con la STESSA
    // identica formula usata per l'altezza della "section" qui sotto
    // (100vh meno le due fasce riservate), non piu' una percentuale vh
    // fissa scollegata dallo spazio reale. Prima (75.6vh/71.4vh) poteva
    // essere PIU' GRANDE dello spazio davvero disponibile su schermi
    // bassi (es. telefono in orizzontale), causando foto tagliate e
    // sovrapposte a didascalie/footer. Cosi' la foto riempie sempre
    // esattamente la fascia disponibile, mai di piu': niente piu' tagli,
    // niente piu' sovrapposizioni, su nessuno schermo.
    const galleryHeight = `calc(100vh - ${headerReserved}px - ${bottomReservedHeight}px - ${galleryBottomGapPhone}px)`
    // Piccolo margine aggiuntivo SOLO per allontanare un po' le didascalie
    // dalle foto, senza toccare bottomReservedHeight (che definisce la
    // fascia della galleria, gia' corretta cosi' com'e').
    const captionsExtraGap = isPhone ? 14 : 18
    // Su smartphone le didascalie vengono alzate di una riga (~16px)
    // per non accavallarsi al footer "CONTACT" in basso a destra, che
    // su schermi stretti e' piu' vicino al bordo inferiore.
    const captionsPhoneLift = isPhone ? 16 : 0

    useEffect(() => {
        if (typeof window === "undefined") return
        const onResize = () => {
            startTransition(() => {
                // Soglia originale (768): un telefono in orizzontale con
                // larghezza minore di 768px usa comunque le regole
                // "isPhone" - il fix per la galleria tagliata non sta nel
                // breakpoint, ma nel far coincidere sempre l'altezza delle
                // foto con lo spazio verticale REALMENTE disponibile (vedi
                // galleryHeight qui sotto).
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
        // Su desktop la galleria scorre in orizzontale, quindi l'elemento
        // "attivo" e' quello piu' vicino al centro orizzontale dello
        // scroller. Su smartphone scorre in verticale: stessa logica, ma
        // sull'asse Y invece che X.
        const scrollerCenter = isPhone
            ? scrollerRect.top + scrollerRect.height / 2
            : scrollerRect.left + scrollerRect.width / 2

        let closestIndex = 0
        let closestDistance = Number.POSITIVE_INFINITY
        itemRefs.current.forEach((node, index) => {
            if (!node) return
            const rect = node.getBoundingClientRect()
            const itemCenter = isPhone
                ? rect.top + rect.height / 2
                : rect.left + rect.width / 2
            const distance = Math.abs(scrollerCenter - itemCenter)
            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = index
            }
        })

        startTransition(() => {
            setActiveIndex(closestIndex)
        })
    }, [isPhone])

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

    const onWheel = useCallback(
        (event) => {
            // Su smartphone la galleria scorre in verticale: la rotellina
            // (o il gesto touch) deve scorrere nativamente come farebbe
            // qualsiasi altro elemento con overflow-y, quindi qui non
            // c'e' nulla da redirigere.
            if (isPhone) return
            if (!scrollerRef.current) return
            scrollerRef.current.scrollLeft += event.deltaY + event.deltaX
        },
        [isPhone]
    )

    const onPointerDown = useCallback(
        (event) => {
            // Su smartphone lo scorrimento verticale e' nativo (nessuna
            // simulazione di drag da fare, a differenza del trascinamento
            // orizzontale su desktop che serve per emulare lo scroll con
            // mouse/trackpad su un asse che il browser non gestisce da solo).
            if (isPhone) return
            if (!scrollerRef.current) return
            dragStateRef.current.dragging = true
            dragStateRef.current.startX = event.clientX
            dragStateRef.current.startScrollLeft = scrollerRef.current.scrollLeft
            scrollerRef.current.setPointerCapture(event.pointerId)
        },
        [isPhone]
    )

    const onPointerMove = useCallback(
        (event) => {
            if (isPhone) return
            if (!scrollerRef.current || !dragStateRef.current.dragging) return
            const delta = event.clientX - dragStateRef.current.startX
            scrollerRef.current.scrollLeft =
                dragStateRef.current.startScrollLeft - delta
        },
        [isPhone]
    )

    const onPointerUp = useCallback(
        (event) => {
            if (isPhone) return
            if (!scrollerRef.current) return
            dragStateRef.current.dragging = false
            scrollerRef.current.releasePointerCapture(event.pointerId)
        },
        [isPhone]
    )

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
                    height: `calc(100vh - ${headerReserved}px - ${bottomReservedHeight}px - ${galleryBottomGapPhone}px)`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    zIndex: 1,
                }}
            >
                <div
                    ref={scrollerRef}
                    onWheel={onWheel}
                    onPointerDown={isPhone ? undefined : onPointerDown}
                    onPointerMove={isPhone ? undefined : onPointerMove}
                    onPointerUp={isPhone ? undefined : onPointerUp}
                    onPointerCancel={isPhone ? undefined : onPointerUp}
                    style={{
                        width: "100%",
                        height: "100%",
                        // Su desktop scorre in orizzontale (overflow-x),
                        // su smartphone in verticale (overflow-y) - questa
                        // e' la differenza chiave richiesta: altezza fissa
                        // + scorrimento a destra su desktop, larghezza
                        // fissa + scorrimento in basso su smartphone.
                        overflowX: isPhone ? "hidden" : "auto",
                        overflowY: isPhone ? "auto" : "hidden",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        touchAction: isPhone ? "pan-y" : "pan-x",
                        cursor: isPhone
                            ? "default"
                            : dragStateRef.current.dragging
                              ? "grabbing"
                              : "grab",
                        // Su desktop, a riposo (scrollLeft 0), non e' il
                        // BORDO sinistro della prima foto a partire dal
                        // centro della pagina: e' il suo ASSE VERTICALE
                        // (centro) a coincidere esattamente con l'asse che
                        // divide la pagina in due (50vw) - da qui il
                        // paddingLeft calcolato. Su smartphone (scroll
                        // verticale, foto a piena larghezza) questo trucco
                        // non serve: basta il gutter laterale standard.
                        paddingLeft: isPhone
                            ? horizontalGutter
                            : `calc(50vw - ${firstImageHalfWidth}px)`,
                        paddingRight: horizontalGutter,
                        paddingTop: isPhone ? gap : 0,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            display: isPhone ? "flex" : "inline-flex",
                            flexDirection: isPhone ? "column" : "row",
                            alignItems: "center",
                            gap,
                            minHeight: isPhone ? "auto" : galleryHeight,
                            width: isPhone ? "100%" : "auto",
                            // Spazio finale: su desktop a destra (permette
                            // di scorrere l'ultima foto fino al centro),
                            // su smartphone in basso (stesso scopo, sul
                            // nuovo asse verticale).
                            paddingRight: isPhone ? 0 : "35vw",
                            paddingBottom: isPhone ? "20vh" : 0,
                        }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={`${item.title}-${index}`}
                                ref={(node) => {
                                    itemRefs.current[index] = node
                                }}
                                style={{
                                    height: isPhone ? "auto" : galleryHeight,
                                    // Su desktop niente larghezza fissa (la
                                    // larghezza segue l'altezza fissa e le
                                    // proporzioni naturali). Su smartphone
                                    // e' l'opposto: larghezza fissa, altezza
                                    // libera - cosi' le proporzioni restano
                                    // comunque rispettate, solo sull'asse
                                    // opposto.
                                    width: isPhone ? photoWidthPhone : "auto",
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
                                        height: isPhone ? "auto" : "100%",
                                        width: isPhone ? "100%" : "auto",
                                        // Su desktop limite di LARGHEZZA per
                                        // le foto molto panoramiche; su
                                        // smartphone limite di ALTEZZA per
                                        // quelle molto verticali - in
                                        // entrambi i casi objectFit
                                        // "contain" garantisce che l'intera
                                        // immagine resti visibile, senza
                                        // mai essere tagliata.
                                        maxWidth: isPhone ? "none" : "58.8vw",
                                        maxHeight: isPhone ? "70vh" : "none",
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
                    // Su smartphone le didascalie partono dal margine
                    // sinistro (come il resto del layout mobile) invece
                    // che da meta' pagina, dove su schermi stretti
                    // lascerebbero troppo poco spazio al testo.
                    left: isPhone ? horizontalGutter : "50vw",
                    top: `calc(100vh - ${bottomReservedHeight}px + ${captionsExtraGap}px - ${captionsPhoneLift}px)`,
                    width: isPhone
                        ? `calc(100vw - ${horizontalGutter * 2}px)`
                        : `calc(50vw - ${horizontalGutter}px)`,
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
