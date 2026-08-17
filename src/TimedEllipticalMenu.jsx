import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    startTransition,
} from "react"
import { motion, useInView } from "framer-motion"

// Convertito da Framer Code Component a componente React standalone.
// Rimosse le API esclusive di Framer:
//   - "framer" (addPropertyControls, ControlType, useIsStaticRenderer)
//   - i commenti @framerSupportedLayoutWidth/@framerSupportedLayoutHeight
// framer-motion invece è una libreria npm normale e funziona identica.

// Video caricati direttamente nel repo (non più da framerusercontent.com):
// Vite li impacchetta come asset statici col path base corretto incluso,
// esattamente come fa per le immagini della gallery. Metti i tuoi file
// video con questi stessi nomi in src/assets/videos/ (vedi note in fondo
// al file per le dimensioni consigliate e i limiti di GitHub).
import selectedWorksVideo from "./assets/videos/selected-works.mp4"
import exhibitionsVideo from "./assets/videos/exhibitions.mp4"

const MENU_ITEMS = [
    {
        label: "SELECTED WORKS",
        href: "/selected-works",
        left: "20%",
        top: "20%",
    },
    { label: "EXHIBITIONS", href: "/exhibitions", left: "45%", top: "38%" },
    { label: "CONTACTS", href: "/contact", left: "80%", top: "50%" },
    { label: "DOWNLOAD PORTFOLIO", href: "/clouds", left: "63%", top: "70%" },
]

const VIDEO_SOURCES = {
    "SELECTED WORKS": selectedWorksVideo,
    EXHIBITIONS: exhibitionsVideo,
}

const VIDEO_PLAYLIST = [
    VIDEO_SOURCES["SELECTED WORKS"],
    VIDEO_SOURCES.EXHIBITIONS,
]

/**
 * Menu ellittico animato a rotazione temporizzata.
 *
 * Props (equivalenti ai vecchi Property Controls di Framer):
 * @param {number}  durationSeconds - non usato direttamente (il timer è fisso a 3s, vedi nota sotto)
 * @param {string}  textColor
 * @param {string}  markerColor
 * @param {number}  fontSize
 * @param {number}  markerWidth
 */
export default function TimedEllipticalMenu({
    durationSeconds = 3,
    textColor = "#FFFFFF",
    markerColor = "#FFFFFF",
    fontSize = 15,
    markerWidth = 14,
}) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [activeVideoIndex, setActiveVideoIndex] = useState(0)
    const [viewportWidth, setViewportWidth] = useState(1440)
    const [canHover, setCanHover] = useState(false)
    const [twistCount, setTwistCount] = useState(0)
    const [isLabelHovered, setIsLabelHovered] = useState(false)
    const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false)
    const [downloadPopupPosition, setDownloadPopupPosition] = useState({
        left: 16,
        top: 16,
    })
    const containerRef = useRef(null)
    const activeLinkRef = useRef(null)
    const popupRef = useRef(null)
    const videoRef = useRef(null)
    // Fuori da Framer non esiste un "renderer statico" (preview/canvas):
    // siamo sempre lato browser, quindi isStatic è sempre false.
    const isStatic = false
    const isInView = useInView(containerRef, { amount: 0.2 })
    void durationSeconds

    const advance = useCallback(() => {
        startTransition(() => {
            setActiveIndex((prev) => (prev + 1) % MENU_ITEMS.length)
        })
    }, [])

    const advanceVideo = useCallback(() => {
        startTransition(() => {
            setActiveVideoIndex((prev) => (prev + 1) % VIDEO_PLAYLIST.length)
        })
    }, [])

    const activeItem = useMemo(() => MENU_ITEMS[activeIndex], [activeIndex])
    const downloadIndex = useMemo(
        () =>
            MENU_ITEMS.findIndex((item) => item.label === "DOWNLOAD PORTFOLIO"),
        []
    )
    const activeVideoSrc = useMemo(
        () => VIDEO_PLAYLIST[activeVideoIndex],
        [activeVideoIndex]
    )
    const isDownloadPortfolio = useMemo(
        () => activeItem.label === "DOWNLOAD PORTFOLIO",
        [activeItem.label]
    )
    const expandedMarkerWidth = useMemo(
        () => Math.max(markerWidth * 4, markerWidth + 42),
        [markerWidth]
    )
    const edgeInset = useMemo(
        () => Math.max(8, expandedMarkerWidth * 0.5),
        [expandedMarkerWidth]
    )
    const isPhone = viewportWidth <= 520
    const horizontalGutter = isPhone ? 16 : edgeInset
    const phoneMaxLabelWidth = useMemo(
        () =>
            Math.max(160, Math.min(260, viewportWidth - horizontalGutter * 2)),
        [horizontalGutter, viewportWidth]
    )
    const safeLeft = useMemo(() => {
        if (!isPhone)
            return `clamp(${edgeInset}px, ${activeItem.left}, calc(100% - ${edgeInset}px))`
        return `clamp(${horizontalGutter}px, ${activeItem.left}, calc(100% - ${horizontalGutter + phoneMaxLabelWidth}px))`
    }, [
        activeItem.left,
        edgeInset,
        horizontalGutter,
        isPhone,
        phoneMaxLabelWidth,
    ])
    const computedFontSize = useMemo(() => {
        if (!isPhone) return `${fontSize}px`
        return `clamp(${Math.max(11, fontSize * 0.8)}px, ${Math.max(3.2, fontSize * 0.9)}vw, ${fontSize}px)`
    }, [fontSize, isPhone])
    const activeDurationMs = 3000

    useEffect(() => {
        if (!isInView) return
        if (typeof window === "undefined") return
        if (isDownloadPopupOpen) return
        const timeoutId = window.setTimeout(advance, activeDurationMs)
        return () => window.clearTimeout(timeoutId)
    }, [activeDurationMs, activeIndex, advance, isDownloadPopupOpen, isInView])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (!isInView) return
        if (!videoRef.current) return

        const playPromise = videoRef.current.play()
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // Ignora silenziosamente gli errori di autoplay bloccato dal browser.
            })
        }
    }, [activeVideoSrc, isInView])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const readViewport = () => {
                startTransition(() => {
                    setViewportWidth(window.innerWidth)
                })
            }
            readViewport()
            window.addEventListener("resize", readViewport)
            return () => window.removeEventListener("resize", readViewport)
        }
    }, [])

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            typeof window.matchMedia !== "undefined"
        ) {
            const mediaQuery = window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            )
            const updateHoverCapability = () => {
                startTransition(() => {
                    setCanHover(mediaQuery.matches)
                })
            }
            updateHoverCapability()
            mediaQuery.addEventListener("change", updateHoverCapability)
            return () =>
                mediaQuery.removeEventListener("change", updateHoverCapability)
        }
    }, [])

    // Hover: cambia il colore E fa ruotare l'etichetta sul proprio asse.
    const handleLabelHoverEnter = useCallback(() => {
        if (!canHover) return
        startTransition(() => {
            setIsLabelHovered(true)
            setTwistCount((prev) => prev + 1)
        })
    }, [canHover])

    const handleLabelHoverLeave = useCallback(() => {
        if (!canHover) return
        startTransition(() => {
            setIsLabelHovered(false)
        })
    }, [canHover])

    // Click: fa ruotare l'etichetta sul proprio asse (funziona anche su touch,
    // per questo non è vincolato a canHover).
    const handleLabelClick = useCallback(() => {
        startTransition(() => {
            setTwistCount((prev) => prev + 1)
        })
    }, [])

    const closeDownloadPopup = useCallback(() => {
        startTransition(() => {
            setIsDownloadPopupOpen(false)
        })
    }, [])

    const updateDownloadPopupPosition = useCallback(() => {
        if (typeof window === "undefined") return
        if (!activeLinkRef.current) return
        const rect = activeLinkRef.current.getBoundingClientRect()
        const popupWidth = Math.min(96, Math.max(92, window.innerWidth - 20))
        const popupHeight = 50
        const margin = 10
        const preferredLeft = rect.left + rect.width / 2 - popupWidth / 2
        const preferredTop = rect.bottom + 10
        const safeLeftPx = Math.max(
            margin,
            Math.min(preferredLeft, window.innerWidth - popupWidth - margin)
        )
        const safeTopPx = Math.max(
            margin,
            Math.min(preferredTop, window.innerHeight - popupHeight - margin)
        )
        startTransition(() => {
            setDownloadPopupPosition({ left: safeLeftPx, top: safeTopPx })
        })
    }, [])

    useEffect(() => {
        if (!isDownloadPopupOpen) return
        updateDownloadPopupPosition()
        if (typeof window !== "undefined") {
            const onResizeOrScroll = () => updateDownloadPopupPosition()
            window.addEventListener("resize", onResizeOrScroll)
            window.addEventListener("scroll", onResizeOrScroll, true)
            return () => {
                window.removeEventListener("resize", onResizeOrScroll)
                window.removeEventListener("scroll", onResizeOrScroll, true)
            }
        }
    }, [isDownloadPopupOpen, updateDownloadPopupPosition])

    useEffect(() => {
        if (!isDownloadPopupOpen) return
        if (typeof window === "undefined" || typeof document === "undefined")
            return

        const outsideClickListener = (event) => {
            const target = event.target
            const insidePopup = popupRef.current?.contains(target) ?? false
            const insideTrigger =
                activeLinkRef.current?.contains(target) ?? false
            if (!insidePopup && !insideTrigger) closeDownloadPopup()
        }

        const autoCloseTimeout = window.setTimeout(() => {
            closeDownloadPopup()
        }, 10000)

        document.addEventListener("mousedown", outsideClickListener)
        return () => {
            window.clearTimeout(autoCloseTimeout)
            document.removeEventListener("mousedown", outsideClickListener)
        }
    }, [closeDownloadPopup, isDownloadPopupOpen])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                background: "transparent",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    position: "fixed",
                    left: "50%",
                    top: "50%",
                    width: "100vw",
                    height: "100vh",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                }}
                aria-hidden="true"
            >
                <video
                    ref={videoRef}
                    src={activeVideoSrc ?? undefined}
                    autoPlay
                    muted
                    playsInline
                    controls={false}
                    preload="metadata"
                    onEnded={advanceVideo}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center center",
                        display: "block",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                    }}
                />
            </div>
            {/* Intestazione statica: stesso font/stile del menu, sempre bianca,
                non è un link, non cambia colore e non si muove mai. */}
            <div
                style={{
                    position: "absolute",
                    zIndex: 2,
                    top: isPhone ? 20 : 28,
                    left: isPhone ? 16 : horizontalGutter,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    fontFamily: "Inter, Helvetica, Arial, sans-serif",
                    fontWeight: 500,
                    fontSize: computedFontSize,
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            >
                CLAUDIA MANGONE
            </div>
            <a
                ref={activeLinkRef}
                href={activeItem.href}
                onMouseEnter={handleLabelHoverEnter}
                onMouseLeave={handleLabelHoverLeave}
                onClick={(event) => {
                    handleLabelClick()
                    if (activeItem.label === "DOWNLOAD PORTFOLIO") {
                        event.preventDefault()
                        updateDownloadPopupPosition()
                        startTransition(() => {
                            if (downloadIndex >= 0)
                                setActiveIndex(downloadIndex)
                            setIsDownloadPopupOpen((prev) => !prev)
                        })
                    }
                }}
                style={{
                    position: "absolute",
                    zIndex: 2,
                    left: safeLeft,
                    top: `clamp(10px, ${activeItem.top}, calc(100% - 10px))`,
                    transform: isPhone
                        ? "translate(0%, -50%)"
                        : "translate(-50%, -50%)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                    color: textColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    whiteSpace:
                        isPhone && isDownloadPortfolio ? "normal" : "nowrap",
                    width:
                        isPhone && isDownloadPortfolio
                            ? `${phoneMaxLabelWidth}px`
                            : "auto",
                    maxWidth: isPhone ? `${phoneMaxLabelWidth}px` : "none",
                    minWidth: isPhone ? "0" : "max-content",
                    fontSize: computedFontSize,
                    fontFamily: "Inter, Helvetica, Arial, sans-serif",
                    fontWeight: 500,
                    textAlign:
                        isPhone && isDownloadPortfolio ? "center" : "left",
                    // Necessario perche' il rotateX del blocco marker+testo
                    // (vedi sotto) risulti un vero giro 3D e non un
                    // semplice schiacciamento verticale piatto.
                    perspective: 700,
                }}
                aria-label={`Open ${activeItem.label}`}
            >
                {/* Marker (rettangolo) + testo ora ruotano INSIEME, come
                    un unico blocco, attorno all'asse orizzontale che
                    taglia le lettere a metà (rotateX). */}
                <motion.span
                    key={`${twistCount}`}
                    initial={false}
                    animate={
                        twistCount > 0 ? { rotateX: [0, 360] } : { rotateX: 0 }
                    }
                    transition={{ duration: 0.75, ease: "easeInOut" }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        transformStyle: "preserve-3d",
                    }}
                >
                    <motion.span
                        initial={false}
                        animate={{
                            color:
                                isLabelHovered && canHover
                                    ? "#A6FF00"
                                    : markerColor,
                            boxShadow:
                                isLabelHovered && canHover
                                    ? "0 0 8px rgba(166, 255, 0, 0.55)"
                                    : "0 0 0 rgba(0, 0, 0, 0)",
                        }}
                        transition={{ duration: 1.15, ease: "easeInOut" }}
                        style={{ display: "inline-flex", flexShrink: 0 }}
                    >
                        <motion.span
                            key={`${activeIndex}-${markerWidth}`}
                            aria-hidden="true"
                            initial={{ width: markerWidth }}
                            animate={{
                                width: [
                                    markerWidth,
                                    expandedMarkerWidth,
                                    markerWidth,
                                ],
                            }}
                            transition={{
                                duration: 0.42,
                                ease: "easeInOut",
                                times: [0, 0.45, 1],
                            }}
                            style={{
                                display: "inline-block",
                                height: 4,
                                background: "currentColor",
                                flexShrink: 0,
                            }}
                        />
                    </motion.span>
                    <motion.span
                        initial={false}
                        animate={{
                            color:
                                isLabelHovered && canHover
                                    ? "#A6FF00"
                                    : textColor,
                        }}
                        transition={{ duration: 1.15, ease: "easeInOut" }}
                        style={{
                            lineHeight: 1.1,
                            textShadow:
                                isLabelHovered && canHover
                                    ? "0 0 10px rgba(166, 255, 0, 0.55)"
                                    : "0 0 0 rgba(0, 0, 0, 0)",
                        }}
                    >
                        {activeItem.label}
                    </motion.span>
                </motion.span>
            </a>
            {isDownloadPopupOpen && (
                <motion.div
                    ref={popupRef}
                    role="menu"
                    aria-label="Download portfolio language options"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: [0.94, 1.03, 1] }}
                    transition={{
                        duration: 0.28,
                        ease: "easeOut",
                        times: [0, 0.6, 1],
                    }}
                    style={{
                        position: "fixed",
                        left: downloadPopupPosition.left,
                        top: downloadPopupPosition.top,
                        width: "min(96px, calc(100vw - 20px))",
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "6px 8px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 10,
                        zIndex: 10002,
                    }}
                >
                    <a
                        role="menuitem"
                        href="https://drive.usercontent.google.com/download?id=10e9MGVYh1pgnaj0mjs7Q5-hp6FFlmVdv&export=download&confirm=t"
                        download
                        onClick={closeDownloadPopup}
                        style={{
                            color: "#FFFFFF",
                            textDecoration: "none",
                            padding: "5px 0",
                            textAlign: "center",
                            letterSpacing: "0.6px",
                            textTransform: "uppercase",
                            fontFamily: "Inter, Helvetica, Arial, sans-serif", // Stesso font del menu
                            fontSize: "14px", // Leggermente più piccolo del menu principale per gerarchia
                        }}
                    >
                        ITA
                    </a>
                    <a
                        role="menuitem"
                        href="https://drive.usercontent.google.com/download?id=1XrckMoMlpYXX7EW0XZ2UgCJ02kaqR1Nh&export=download&confirm=t"
                        download
                        onClick={closeDownloadPopup}
                        style={{
                            color: "#FFFFFF",
                            textDecoration: "none",
                            padding: "5px 0",
                            textAlign: "center",
                            letterSpacing: "0.6px",
                            textTransform: "uppercase",
                            fontFamily: "Inter, Helvetica, Arial, sans-serif", // Stesso font del menu
                            fontSize: "14px", // Leggermente più piccolo del menu principale per gerarchia
                        }}
                    >
                        ENG
                    </a>
                </motion.div>
            )}
        </div>
    )
}

/*
 * NOTE SUI VIDEO LOCALI (src/assets/videos/)
 * -------------------------------------------
 * - GitHub blocca il push di singoli file oltre i 100MB, e avvisa già
 *   sopra i 50MB. Se i tuoi export sono più pesanti, comprimili prima
 *   (es. con HandBrake, oppure via ffmpeg:
 *   `ffmpeg -i input.mov -vcodec libx264 -crf 28 -preset slow -an output.mp4`)
 *   oppure usa Git LFS per la repo.
 * - Per il web, un mp4 H.264 (yuv420p) senza audio, larghezza max
 *   1920px e bitrate contenuto, è il formato più compatibile e leggero
 *   per un video di sfondo in autoplay/muted come questo.
 * - I nomi dei file devono corrispondere esattamente a quelli importati
 *   qui sopra (selected-works.mp4, exhibitions.mp4). Per aggiungere un
 *   terzo video, aggiungi un nuovo import e una nuova voce in
 *   VIDEO_SOURCES/VIDEO_PLAYLIST.
 */
