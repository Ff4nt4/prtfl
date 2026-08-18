import { useEffect, useState, startTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"

// --- BLOCCO ORIZZONTALE PER SMARTPHONE ---
// Il sito e' pensato per essere usato in orizzontale. Su dispositivi
// touch (telefoni, tablet) mostriamo un overlay a schermo intero finche'
// il dispositivo resta in verticale, con un'animazione minimal (icona
// che ruota da verticale a orizzontale) e la scritta "please rotate
// your phone". Il resto del sito (menu, gallerie, pagine) resta montato
// sotto, invariato: appena l'utente gira davvero il telefono in
// orizzontale, l'overlay sparisce e il sito appare, esattamente con le
// stesse regole/misure gia' definite per desktop (vedi la nota sui
// breakpoint in GalleryPage.jsx, PageHeader.jsx, ContactsPage.jsx e
// TimedEllipticalMenu.jsx: abbassati a 480px cosi' un telefono in
// orizzontale - che parte da ~560/600px in su anche sui modelli piu'
// piccoli - non attiva mai piu' le regole "isPhone", e usa sempre le
// stesse regole del desktop).
//
// NOTA IMPORTANTE su "fullscreen": i browser mobili (soprattutto Safari
// su iOS) non permettono di forzare il fullscreen o il blocco
// dell'orientamento in modo affidabile e programmatico - serve un vero
// gesto dell'utente (tap) e anche cosi' il supporto varia da browser a
// browser. Qui tentiamo comunque, nel modo piu' compatibile possibile
// (Fullscreen API + Screen Orientation API, entrambe "best effort" e
// silenziosamente ignorate se non supportate), sia in automatico al
// passaggio in orizzontale sia al primo tocco dell'utente sulla pagina
// (che e' il vero gesto richiesto dai browser per concedere il
// fullscreen).

function requestFullscreenAndLock() {
    if (typeof document === "undefined") return

    try {
        const el = document.documentElement
        if (!document.fullscreenElement) {
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {})
            } else if (el.webkitRequestFullscreen) {
                // Fallback prefissato (vecchie versioni di Safari/iOS)
                el.webkitRequestFullscreen()
            }
        }
    } catch (error) {
        // Ignorato volutamente: se il browser rifiuta (manca il gesto
        // utente, API non supportata, ecc.) il sito resta comunque
        // fruibile in orizzontale dentro la normale UI del browser.
    }

    try {
        if (
            typeof window !== "undefined" &&
            window.screen &&
            window.screen.orientation &&
            window.screen.orientation.lock
        ) {
            window.screen.orientation.lock("landscape").catch(() => {})
        }
    } catch (error) {
        // Idem: ignorato, e' solo un potenziamento quando disponibile.
    }
}

// Icona minimale: un telefono che ruota da verticale a orizzontale e
// ritorno, in loop lento - nessun rimbalzo elastico, solo un
// assestamento morbido (ease "easeInOut"), coerente con lo stile del
// resto del sito.
function RotatePhoneIcon() {
    return (
        <motion.svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 0, 90, 90, 0] }}
            transition={{
                duration: 2.4,
                times: [0, 0.25, 0.55, 0.8, 1],
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.6,
            }}
            style={{ display: "block" }}
        >
            <rect
                x="17"
                y="6"
                width="22"
                height="44"
                rx="4"
                stroke="#FFFFFF"
                strokeWidth="2.4"
            />
            <line
                x1="24"
                y1="43"
                x2="32"
                y2="43"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
        </motion.svg>
    )
}

export default function RotateDeviceGate({ children }) {
    // undefined = non ancora determinato (evita un flash dell'overlay
    // durante il primissimo render lato client, prima che matchMedia
    // sia disponibile).
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [isPortrait, setIsPortrait] = useState(false)
    const [hasMeasured, setHasMeasured] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return

        const touchQuery = window.matchMedia("(pointer: coarse)")
        const portraitQuery = window.matchMedia("(orientation: portrait)")

        const update = () => {
            startTransition(() => {
                setIsTouchDevice(touchQuery.matches)
                setIsPortrait(portraitQuery.matches)
                setHasMeasured(true)
            })
        }

        update()
        touchQuery.addEventListener("change", update)
        portraitQuery.addEventListener("change", update)
        return () => {
            touchQuery.removeEventListener("change", update)
            portraitQuery.removeEventListener("change", update)
        }
    }, [])

    const showRotateOverlay = hasMeasured && isTouchDevice && isPortrait

    // Tenta il fullscreen/landscape-lock appena il telefono e' davvero
    // in orizzontale, e di nuovo al primo tocco dell'utente (il vero
    // "gesto" richiesto dai browser per concederlo).
    useEffect(() => {
        if (typeof document === "undefined") return
        if (!isTouchDevice || isPortrait) return

        requestFullscreenAndLock()

        const onFirstInteraction = () => {
            requestFullscreenAndLock()
        }
        document.addEventListener("touchend", onFirstInteraction, {
            once: true,
        })
        document.addEventListener("click", onFirstInteraction, {
            once: true,
        })
        return () => {
            document.removeEventListener("touchend", onFirstInteraction)
            document.removeEventListener("click", onFirstInteraction)
        }
    }, [isTouchDevice, isPortrait])

    return (
        <>
            {children}
            <AnimatePresence>
                {showRotateOverlay && (
                    <motion.div
                        key="rotate-device-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999998,
                            background: "#000000",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 18,
                        }}
                    >
                        <RotatePhoneIcon />
                        <div
                            style={{
                                color: "#FFFFFF",
                                fontFamily:
                                    "Inter, Helvetica, Arial, sans-serif",
                                fontWeight: 500,
                                fontSize: 14,
                                letterSpacing: "0.02em",
                            }}
                        >
                            please rotate your phone
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
