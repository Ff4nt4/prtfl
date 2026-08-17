import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"

// Convertito da Framer Code Component a componente React standalone.
// Rimossi: import { addPropertyControls } from "framer", la addPropertyControls(...)
// finale, l'interface MyComponentProps (vuota, non serve più) e i commenti
// @framerSupportedLayoutWidth/Height (validi solo dentro Framer).

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

    const gap = isPhone ? 12 : 20
    const horizontalGutter = isPhone ? 14 : 36
    const headerReserved = isPhone ? 72 : 96
    const galleryHeight = isPhone ? "50vh" : "58vh"

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

        scroller.addEventListener("scroll", onScroll)
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
        event.preventDefault()
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

    return (
        <main
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "100vh",
                background: "#FFFFFF",
                overflow: "hidden",
                color: "#000000",
            }}
        >
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "#FFFFFF",
                    zIndex: 0,
                }}
                aria-hidden="true"
            />

            <section
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingTop: headerReserved,
                    paddingBottom: isPhone ? 42 : 52,
                    boxSizing: "border-box",
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
                                    width: isPhone ? "72vw" : "62vw",
                                    maxWidth: isPhone ? 520 : 980,
                                    minWidth: isPhone ? 236 : 420,
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

                <div
                    style={{
                        marginTop: isPhone ? 18 : 24,
                        paddingLeft: horizontalGutter,
                        paddingRight: horizontalGutter,
                        boxSizing: "border-box",
                    }}
                >
                    <div
                        style={{
                            width: "min(560px, 100%)",
                            minHeight: 66,
                        }}
                    >
                        <div
                            style={{
                                fontFamily:
                                    "Inter, Helvetica, Arial, sans-serif",
                                fontSize: isPhone ? 13 : 14,
                                lineHeight: 1.35,
                                letterSpacing: "0em",
                                fontWeight: 500,
                                marginBottom: 6,
                            }}
                        >
                            {activeItem.title}
                        </div>
                        <div
                            style={{
                                fontFamily:
                                    "Inter, Helvetica, Arial, sans-serif",
                                fontSize: isPhone ? 12 : 13,
                                lineHeight: 1.45,
                                letterSpacing: "0em",
                                fontWeight: 400,
                            }}
                        >
                            {activeItem.description}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
