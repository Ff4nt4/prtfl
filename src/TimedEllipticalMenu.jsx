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
// Video verticale dedicato allo sfondo della Home su smartphone: sostituisce
// il ciclo dei due video "reel" (selected-works/exhibitions), che restano
// invece usati solo su desktop/tablet (vedi effectiveVideoSrc piu' sotto).
import mobileVideo from "./assets/videos/mobile.mp4"

const MENU_ITEMS = [
    {
        label: "SELECTED WORKS",
        href: "/selected-works",
        left: "20%",
        top: "20%",
    },
    { label: "EXHIBITIONS", href: "/exhibitions", left: "45%", top: "38%" },
    { label: "CONTACT", href: "/contact", left: "80%", top: "50%" },
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
    const [activeVideoIndex, setActiveVideoIndex] = useState(0)
    const [viewportWidth, setViewportWidth] = useState(1440)
    const [canHover, setCanHover] = useState(false)
    const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false)
    const [downloadPopupPosition, setDownloadPopupPosition] = useState({
        left: 16,
        top: 16,
    })
    const containerRef = useRef(null)
    // Riferimento GENERICO all'elemento che ha aperto il popup di download:
    // e' il nodo della specifica voce "DOWNLOAD PORTFOLIO" cliccata (ogni
    // voce vive per conto sua, su ogni dispositivo - vedi EllipticalMenuItem
    // piu' in basso). Usato per posizionare/richiudere il popup.
    const popupAnchorRef = useRef(null)
    const popupRef = useRef(null)
    const videoRef = useRef(null)
    // Fuori da Framer non esiste un "renderer statico" (preview/canvas):
    // siamo sempre lato browser, quindi isStatic è sempre false.
    const isStatic = false
    const isInView = useInView(containerRef, { amount: 0.2 })
    void durationSeconds

    const advanceVideo = useCallback(() => {
        startTransition(() => {
            setActiveVideoIndex((prev) => (prev + 1) % VIDEO_PLAYLIST.length)
        })
    }, [])

    const activeVideoSrc = useMemo(
        () => VIDEO_PLAYLIST[activeVideoIndex],
        [activeVideoIndex]
    )
    // Non serve piu' per l'overshoot di larghezza del vecchio rettangolo
    // (il "boing" e' stato rimosso): resta come margine di sicurezza per
    // riservare spazio alla "coda" che si allunga dalla punta destra
    // della stellina, cosi' non viene mai tagliata vicino ai bordi.
    const expandedMarkerWidth = useMemo(
        () => Math.max(markerWidth * 4, markerWidth + 42),
        [markerWidth]
    )
    const edgeInset = useMemo(
        () => Math.max(8, expandedMarkerWidth * 0.5),
        [expandedMarkerWidth]
    )
    // Soglia UNIFORMATA con PageHeader.jsx, GalleryPage.jsx e
    // ContactsPage.jsx (tutti a 768px): prima qui era 520px, quindi un
    // tablet (es. iPad in verticale, ~768px) vedeva la Home in versione
    // "desktop" ma le altre pagine in versione "phone" - layout
    // incoerente passando da una pagina all'altra. Ora la soglia e' la
    // stessa ovunque nel sito.
    const isPhone = viewportWidth <= 768
    // Su smartphone lo sfondo e' il video verticale dedicato (mobile.mp4),
    // fisso (nessun ciclo tra "reel"). Su desktop/tablet resta il
    // comportamento originale: ciclo tra selected-works.mp4 ed
    // exhibitions.mp4.
    const effectiveVideoSrc = isPhone ? mobileVideo : activeVideoSrc
    const horizontalGutter = isPhone ? 16 : edgeInset
    const phoneMaxLabelWidth = useMemo(
        () =>
            Math.max(160, Math.min(260, viewportWidth - horizontalGutter * 2)),
        [horizontalGutter, viewportWidth]
    )
    // Il limite minimo del clamp non deve mai scendere sotto i 18px,
    // nemmeno su schermi molto stretti: prima poteva restringersi fino
    // a "fontSize * 0.8", ora il pavimento e' sempre 18px.
    const computedFontSize = useMemo(() => {
        if (!isPhone) return `${Math.max(18, fontSize)}px`
        return `clamp(${Math.max(18, fontSize * 0.8)}px, ${Math.max(3.2, fontSize * 0.9)}vw, ${Math.max(18, fontSize)}px)`
    }, [fontSize, isPhone])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (!isInView) return
        if (!videoRef.current) return

        // FIX AUTOPLAY MOBILE: l'attributo "muted" impostato via JSX non
        // basta su iOS/Android - React lo scrive come attributo HTML, ma
        // Safari/Chrome mobile controllano la PROPRIETA' JS dell'elemento
        // <video> per decidere se l'autoplay e' permesso. Se la proprieta'
        // non risulta esplicitamente true PRIMA di play(), il browser
        // blocca silenziosamente la riproduzione (da qui lo sfondo nero
        // fisso, invisibile solo su smartphone). Impostandola qui a mano,
        // subito prima di ogni play(), il video riparte correttamente.
        videoRef.current.muted = true
        videoRef.current.defaultMuted = true

        const playPromise = videoRef.current.play()
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // Ignora silenziosamente gli errori di autoplay bloccato dal browser.
            })
        }
    }, [effectiveVideoSrc, isInView])

    // FALLBACK: su alcuni browser mobile (es. Android con risparmio dati/
    // batteria attivo) l'autoplay resta bloccato anche con muted impostato
    // correttamente via JS. Come rete di sicurezza, al primo tocco/click
    // sulla pagina (richiesto comunque per qualsiasi interazione: aprire
    // il menu, un link, ecc.) riproviamo a far partire il video se
    // risultasse ancora in pausa. Si toglie da solo dopo il primo utilizzo.
    useEffect(() => {
        if (typeof window === "undefined" || typeof document === "undefined")
            return

        const resumeVideoOnFirstInteraction = () => {
            if (videoRef.current && videoRef.current.paused) {
                videoRef.current.muted = true
                const retryPromise = videoRef.current.play()
                if (retryPromise && typeof retryPromise.catch === "function") {
                    retryPromise.catch(() => {})
                }
            }
        }

        document.addEventListener("touchstart", resumeVideoOnFirstInteraction, {
            once: true,
            passive: true,
        })
        document.addEventListener("click", resumeVideoOnFirstInteraction, {
            once: true,
        })
        return () => {
            document.removeEventListener(
                "touchstart",
                resumeVideoOnFirstInteraction
            )
            document.removeEventListener("click", resumeVideoOnFirstInteraction)
        }
    }, [])

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

    const closeDownloadPopup = useCallback(() => {
        startTransition(() => {
            setIsDownloadPopupOpen(false)
        })
    }, [])

    const updateDownloadPopupPosition = useCallback(() => {
        if (typeof window === "undefined") return
        if (!popupAnchorRef.current) return
        const rect = popupAnchorRef.current.getBoundingClientRect()
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

    // Apertura del popup di download da una voce del menu (ogni voce vive
    // per conto sua, su ogni dispositivo, quindi non esiste piu' un unico
    // "link attivo" condiviso): riceve direttamente il nodo DOM della
    // voce cliccata, lo salva come ancora generica e apre/chiude il popup.
    const openDownloadPopup = useCallback(
        (anchorNode) => {
            popupAnchorRef.current = anchorNode
            updateDownloadPopupPosition()
            startTransition(() => {
                setIsDownloadPopupOpen((prev) => !prev)
            })
        },
        [updateDownloadPopupPosition]
    )

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
                popupAnchorRef.current?.contains(target) ?? false
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
                    src={effectiveVideoSrc ?? undefined}
                    autoPlay
                    muted
                    defaultMuted
                    loop={isPhone}
                    playsInline
                    webkit-playsinline="true"
                    controls={false}
                    preload="auto"
                    onEnded={isPhone ? undefined : advanceVideo}
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
                        // Layer scurente ridotto (0.6 -> 0.25): i colori dei
                        // video restano molto piu' vicini all'originale,
                        // mantenendo comunque un minimo di leggibilita' per
                        // il testo bianco sovrapposto.
                        background: "rgba(0, 0, 0, 0.25)",
                    }}
                />
            </div>
            {/* Intestazione statica: stesso font/stile del menu, sempre bianca,
                non è un link, non cambia colore e non si muove mai.
                Posizione e dimensione ora IDENTICHE a quelle di
                PageHeader.jsx (usato in /exhibitions e nelle altre pagine
                secondarie): top 10/12, left 20/56, font-size 18 fissi -
                non piu' derivate dal gutter/font responsive del menu,
                cosi' "CLAUDIA MANGONE" resta nello stesso identico punto
                su ogni pagina del sito. */}
            <div
                style={{
                    position: "absolute",
                    zIndex: 2,
                    top: isPhone ? 10 : 12,
                    left: isPhone ? 20 : 56,
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    fontFamily: "Inter, Helvetica, Arial, sans-serif",
                    fontWeight: 500,
                    fontSize: 18,
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            >
                CLAUDIA MANGONE
            </div>
            {MENU_ITEMS.map((item, index) => (
                <EllipticalMenuItem
                    key={item.label}
                    item={item}
                    index={index}
                    totalItems={MENU_ITEMS.length}
                    textColor={textColor}
                    markerColor={markerColor}
                    markerWidth={markerWidth}
                    edgeInset={edgeInset}
                    canHover={canHover}
                    isPhone={isPhone}
                    horizontalGutter={horizontalGutter}
                    phoneMaxLabelWidth={phoneMaxLabelWidth}
                    computedFontSize={computedFontSize}
                    onDownloadClick={openDownloadPopup}
                />
            ))}
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
                        width: "min(120px, calc(100vw - 20px))",
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "6px 8px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        // Spaziatura tra ITA ed ENG aumentata (10 -> 22),
                        // a parita' di larghezza del pop-up.
                        gap: 22,
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
                            fontSize: "18px", // Almeno 18px come le altre scritte in maiuscolo
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
                            fontSize: "18px", // Almeno 18px come le altre scritte in maiuscolo
                        }}
                    >
                        ENG
                    </a>
                </motion.div>
            )}
        </div>
    )
}

// --- VOCE DI MENU INDIPENDENTE (DESKTOP E SMARTPHONE) ---
// Su ogni dispositivo tutte le voci del menu sono presenti insieme,
// ciascuna nella propria posizione dell'ellisse (item.left/item.top), e
// ognuna ha un proprio ciclo di comparsa/scomparsa ogni 3 secondi,
// INDIPENDENTE dalle altre: non esiste piu' una singola voce "attiva" che
// si sposta - ogni voce vive e si anima per conto suo. Quando il cursore
// (su desktop/dispositivi con hover vero) passa sopra una voce, si blocca
// SOLO il timer di QUELLA voce (resta visibile finche' il cursore non se
// ne va); le altre continuano il proprio ciclo di 3 secondi normalmente.
// Su smartphone (nessun hover reale) il tocco fa comunque ruotare la
// voce e aprire il popup di download, ma non mette mai in pausa il ciclo
// (esattamente come accadeva prima per il tocco sulla voce attiva).
const DESKTOP_CYCLE_MS = 3000

function EllipticalMenuItem({
    item,
    index,
    totalItems,
    textColor,
    markerColor,
    markerWidth,
    edgeInset,
    canHover,
    isPhone,
    horizontalGutter,
    phoneMaxLabelWidth,
    computedFontSize,
    onDownloadClick,
}) {
    const [hasStarted, setHasStarted] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [twistCount, setTwistCount] = useState(0)
    // Incrementato ogni volta che la voce ridiventa visibile: usato come
    // key per far ripartire da capo l'animazione di "srotolamento" delle
    // lettere ad ogni nuova comparsa (non solo alla prima).
    const [revealKey, setRevealKey] = useState(0)
    const anchorRef = useRef(null)

    // Sfalsamento iniziale: la prima accensione di ogni voce e' ritardata
    // in base al proprio indice, cosi' le 4 voci non compaiono tutte nello
    // stesso istante al caricamento della pagina (stesso ritmo del vecchio
    // menu, che le mostrava una alla volta ogni 3s/4 = 750ms).
    useEffect(() => {
        if (typeof window === "undefined") return
        const staggerMs = (DESKTOP_CYCLE_MS / Math.max(1, totalItems)) * index
        const timeoutId = window.setTimeout(() => {
            setHasStarted(true)
            setIsVisible(true)
        }, staggerMs)
        return () => window.clearTimeout(timeoutId)
        // Va eseguito una sola volta al mount della voce.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Ciclo continuo comparsa/scomparsa, ogni 3 secondi, dopo l'accensione
    // iniziale. Si sospende (si "congela" cosi' com'e') finche' il cursore
    // resta sopra la voce - stessa identica logica gia' usata nel resto
    // del sito (stessa logica di pausa-al-hover usata anche altrove nel sito).
    useEffect(() => {
        if (!hasStarted) return
        if (typeof window === "undefined") return
        if (isHovered) return
        const timeoutId = window.setTimeout(() => {
            setIsVisible((prev) => !prev)
        }, DESKTOP_CYCLE_MS)
        return () => window.clearTimeout(timeoutId)
    }, [hasStarted, isVisible, isHovered])

    useEffect(() => {
        if (isVisible) setRevealKey((prev) => prev + 1)
    }, [isVisible])

    const handleEnter = useCallback(() => {
        if (!canHover) return
        setIsHovered(true)
        setTwistCount((prev) => prev + 1)
    }, [canHover])

    const handleLeave = useCallback(() => {
        if (!canHover) return
        setIsHovered(false)
    }, [canHover])

    const isDownloadPortfolio = item.label === "DOWNLOAD PORTFOLIO"

    const handleClick = useCallback(
        (event) => {
            setTwistCount((prev) => prev + 1)
            if (isDownloadPortfolio) {
                event.preventDefault()
                onDownloadClick(anchorRef.current)
            }
        },
        [isDownloadPortfolio, onDownloadClick]
    )

    const isGlowActive = isHovered && canHover
    // Stessa formula di clamp gia' usata in origine per la voce mobile:
    // su smartphone lascia spazio a destra per l'eventuale testo lungo
    // (phoneMaxLabelWidth), su desktop resta centrata sul suo punto
    // dell'ellisse.
    const safeLeft = isPhone
        ? `clamp(${horizontalGutter}px, ${item.left}, calc(100% - ${horizontalGutter + phoneMaxLabelWidth}px))`
        : `clamp(${edgeInset}px, ${item.left}, calc(100% - ${edgeInset}px))`

    return (
        <motion.a
            ref={anchorRef}
            href={item.href}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={handleClick}
            initial={false}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            style={{
                position: "absolute",
                zIndex: 2,
                left: safeLeft,
                top: `clamp(10px, ${item.top}, calc(100% - 10px))`,
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
                whiteSpace: isPhone && isDownloadPortfolio ? "normal" : "nowrap",
                width:
                    isPhone && isDownloadPortfolio
                        ? `${phoneMaxLabelWidth}px`
                        : "auto",
                maxWidth: isPhone ? `${phoneMaxLabelWidth}px` : "none",
                minWidth: isPhone ? "0" : "max-content",
                fontSize: computedFontSize,
                fontFamily: "Inter, Helvetica, Arial, sans-serif",
                fontWeight: 500,
                textAlign: isPhone && isDownloadPortfolio ? "center" : "left",
                perspective: 700,
                // Finche' e' invisibile non deve intercettare click/hover:
                // altrimenti una voce "spenta" bloccherebbe il passaggio
                // del cursore verso quella dietro di lei.
                pointerEvents: isVisible ? "auto" : "none",
            }}
            aria-label={`Open ${item.label}`}
        >
            {/* Area cliccabile allargata, come nella versione mobile. */}
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: -22,
                    pointerEvents: isVisible ? "auto" : "none",
                }}
            />
            <motion.span
                initial={false}
                animate={{ rotateX: twistCount * 360 }}
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
                        color: isGlowActive ? "#A6FF00" : markerColor,
                        boxShadow: isGlowActive
                            ? "0 0 8px rgba(166, 255, 0, 0.55)"
                            : "0 0 0 rgba(0, 0, 0, 0)",
                    }}
                    transition={{ duration: 1.15, ease: "easeInOut" }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >
                    <motion.span
                        key={`star-${revealKey}`}
                        aria-hidden="true"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.65, 1], opacity: 1 }}
                        transition={{
                            duration: 0.45,
                            ease: "easeOut",
                            times: [0, 0.65, 1],
                        }}
                        style={{
                            display: "inline-block",
                            fontSize: Math.max(14, markerWidth),
                            lineHeight: 1,
                            transformOrigin: "center",
                        }}
                    >
                        <motion.span
                            animate={{ scale: [1, 1.28, 1] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.45,
                            }}
                            style={{ display: "inline-block" }}
                        >
                            ✦
                        </motion.span>
                    </motion.span>
                </motion.span>
                <motion.span
                    initial={false}
                    animate={{ color: isGlowActive ? "#A6FF00" : textColor }}
                    transition={{ duration: 1.15, ease: "easeInOut" }}
                    style={{
                        display: "inline-flex",
                        lineHeight: 1.1,
                        textShadow: isGlowActive
                            ? "0 0 10px rgba(166, 255, 0, 0.55)"
                            : "0 0 0 rgba(0, 0, 0, 0)",
                    }}
                >
                    <motion.span
                        key={`label-${revealKey}`}
                        style={{ display: "inline-flex" }}
                    >
                        {item.label.split("").map((char, charIndex) => (
                            <motion.span
                                key={charIndex}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.28,
                                    delay: 0.35 + charIndex * 0.028,
                                    ease: "easeOut",
                                }}
                                style={{ display: "inline-block" }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.span>
                </motion.span>
            </motion.span>
        </motion.a>
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
 * - mobile.mp4 (in src/assets/videos/mobile.mp4) e' un video verticale
 *   dedicato, usato SOLO su smartphone/tablet stretti (isPhone,
 *   viewportWidth <= 768) al posto del ciclo selected-works/exhibitions.
 *   E' in loop singolo (loop={isPhone}), non avanza la playlist desktop.
 *   Su desktop il comportamento resta identico a prima.
 */
