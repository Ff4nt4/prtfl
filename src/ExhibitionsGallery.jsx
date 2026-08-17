import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"

// --- DATI DELLE MOSTRINE ---
const EXHIBITIONS = [
    {
        image: "https://framerusercontent.com/images/fmFTgvoz3alGQypONavsu2dXjGA.jpg?width=12600&height=8400&kb=1931",
        title: "Culvert (2026).",
        description:
            "SOLO EXHIBITION CURATED BY SIMONE S. MELIS AT RISS(E) - VARESE (IT)",
    },
    {
        image: "https://framerusercontent.com/images/NO0MtY1LyK7BllA9EdkEfiifLRs.jpg?width=3717&height=2478&kb=543",
        title: "Collyrium (2026)",
        description:
            "SOLO EXHIBITION AT BACHECA - FLORENCE (IT). COURTESY OF THE GALLERY - PH. LENA SHAPOSHNIKOVA",
    },
    {
        image: "https://framerusercontent.com/images/HPOgyr4VOajySmqJKRArd770k.jpg?width=3840&height=2561&kb=219",
        title: "Ventaglio (2025)",
        description:
            "GROUP EXHIBITION CURATED BY VALERIO NICOLAI AT CLIMA GALLERY - MILANO (IT). COURTESY OF THE GALLERY - PH. FLAVIO PESCATORI",
    },
    {
        image: "https://framerusercontent.com/images/5XMKWdtLQP4zq88qkaxceuDC424.jpg?width=6000&height=4000&kb=872",
        title: "Mostrina (2025)",
        description:
            "GROUP EXHIBITION CURATED BY MARCO AUGUSTO BASSO AND MARTINA MONTAGNA AT PALAZZO BRONZO - GENOA (IT). COURTESY OF PALAZZO BRONZO",
    },
    {
        image: "https://framerusercontent.com/images/F98dRZ9DasMm4Vyjtq0EWlGwfk.jpg?width=4252&height=2835&kb=1566",
        title: "Incandescenze e maree (2025)",
        description:
            "GROUP EXHIBITION CURATED BY MARTINA CIOFFI AT YAG GARAGE - PESCARA (IT). COURTESY OF THE GALLERY - PH. PIERLUIGI FABRIZIO",
    },
    {
        image: "https://framerusercontent.com/images/1jpNlDg0rsbXULNJgiqDdZ1DQ.jpg?width=1280&height=853&kb=28",
        title: "Talents! (2025)",
        description: "OPEN STUDIO AT FONDATION FIMINCO - PARIS (FR).",
    },
    {
        image: "https://framerusercontent.com/images/m9b4tIjd7LsVJRSLReU6L2ZpHs.jpg?width=1536&height=1024&kb=752",
        title: "Parco d’arte ambientale di Torre Mammona (2023–25)",
        description: "OPERA SITE SPECIFIC - ASSISI (IT)",
    },
    {
        image: "https://framerusercontent.com/images/e1p45EUYTG5JkDRte6q73GD3hw.jpg?width=3740&height=2805&kb=442",
        title: "Black’n’yellow Black’n’yellow (2023)",
        description:
            "SOLO EXHIBITION CURATED BY CECILIA MENTASTI AT ANONIMAKUNSTHALLE - VARESE (it)",
    },
    {
        image: "https://framerusercontent.com/images/S8I2BRZBZ7nlUIoTOqfL53VFP2c.jpg?width=4140&height=2760&kb=408",
        title: "I re non toccano le porte (2024)",
        description:
            "GROUP EXHIBITION CURATED BY ERMANNO CRISTINI AND GIANCARLO NORESE AT CASA SCAGLIONI - CASTELPONZONE (IT)",
    },
    {
        image: "https://framerusercontent.com/images/AKYSXeB1lMbQ05zsGcYpkKeBJs.jpg?width=3508&height=2480&kb=137",
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
    const scrollerRef = useRef(null)
    const itemRefs = useRef([])
    const dragStateRef = useRef({
        dragging: false,
        startX: 0,
        startScrollLeft: 0,
    })

    const gap = isPhone ? 12 : 28
    const horizontalGutter = isPhone ? 16 : 48
    const headerReserved = isPhone ? 72 : 100
    const galleryHeight = isPhone ? "60vh" : "55vh"

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
        fontSize: isPhone ? 13 : 15,
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
            {/* --- HEADER FISSO --- */}
            <header
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: headerReserved,
                    paddingLeft: horizontalGutter,
                    paddingRight: horizontalGutter,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            >
                <a href="/" style={navLinkStyle}>
                    CLAUDIA MANGONE
                </a>
                
                <div
                    style={{
                        ...navLinkStyle,
                        position: "absolute",
                        left: "52%",
                        transform: "translateX(-50%)",
                        cursor: "default",
                    }}
                >
                    EXHIBITIONS
                </div>
                
                <div style={{ width: isPhone ? 50 : 100 }} aria-hidden="true" />
            </header>

            {/* --- CONTENUTO PRINCIPALE --- */}
            <section
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingTop: headerReserved,
                    boxSizing: "border-box",
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
                        paddingLeft: horizontalGutter,
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
                                    width: isPhone ? "75vw" : "58vw",
                                    maxWidth: isPhone ? 580 : 1100,
                                    minWidth: isPhone ? 280 : 500,
                                    flex: "0 0 auto",
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    draggable={false}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        userSelect: "none",
                                        display: "block",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- CASELLA DIDASCALIE FISSA --- */}
                <div
                    style={{
                        position: "absolute",
                        bottom: isPhone ? 60 : 66,
                        left: horizontalGutter,
                        width: "min(480px, 100% - 32px)",
                        boxSizing: "border-box",
                        zIndex: 2,
                        userSelect: "none",
                    }}
                >
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: isPhone ? 12 : 13,
                            lineHeight: 1.45,
                            letterSpacing: "0em",
                            fontWeight: 500,
                            marginBottom: 4,
                            textTransform: "uppercase",
                        }}
                    >
                        {activeItem.title}
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: isPhone ? 11 : 12,
                            lineHeight: 1.55,
                            letterSpacing: "0.01em",
                            fontWeight: 400,
                            color: "rgba(0,0,0,0.7)",
                        }}
                    >
                        {activeItem.description}
                    </div>
                </div>
            </section>

            {/* --- FOOTER A DESTRA --- */}
            <footer
                style={{
                    position: "fixed",
                    bottom: 0,
                    right: 0,
                    width: "auto",
                    height: isPhone ? 50 : 60,
                    paddingRight: horizontalGutter,
                    display: "flex",
                    alignItems: "center",
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
