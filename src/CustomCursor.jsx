import { useEffect, useState, startTransition } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"

/**
 * Cursore custom a forma di cuore, attivo su TUTTE le pagine del sito
 * (va montato una sola volta in App.jsx, fuori dalle <Routes>, così
 * resta in vita mentre si naviga tra le pagine).
 *
 * - Sostituisce completamente il cursore nativo: mai freccia, mai manina.
 * - Si dilata quando è sopra un link/elemento cliccabile.
 * - Pulsa ad ogni click, ovunque sulla pagina.
 *
 * Attivo solo su dispositivi con mouse reale (hover: hover / pointer: fine):
 * su touch non ha senso, e lì il cursore nativo comunque non esiste.
 */
export default function CustomCursor() {
    const [canHover, setCanHover] = useState(false)
    const [cursorX, setCursorX] = useState(0)
    const [cursorY, setCursorY] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [isOverLink, setIsOverLink] = useState(false)
    const [pulseCount, setPulseCount] = useState(0)

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            typeof window.matchMedia === "undefined"
        )
            return
        const mediaQuery = window.matchMedia(
            "(hover: hover) and (pointer: fine)"
        )
        const update = () =>
            startTransition(() => setCanHover(mediaQuery.matches))
        update()
        mediaQuery.addEventListener("change", update)
        return () => mediaQuery.removeEventListener("change", update)
    }, [])

    // Nasconde il cursore nativo OVUNQUE nella pagina (con !important, così
    // nessuno stile locale come "cursor: grab" nella galleria può farlo
    // ricomparire) finché il cursore custom è attivo.
    useEffect(() => {
        if (typeof document === "undefined" || !canHover) return

        const styleTag = document.createElement("style")
        styleTag.setAttribute("data-custom-cursor", "true")
        styleTag.innerHTML = "* { cursor: none !important; }"
        document.head.appendChild(styleTag)

        return () => {
            styleTag.remove()
        }
    }, [canHover])

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            typeof document === "undefined" ||
            !canHover
        )
            return

        const onMouseMove = (event) => {
            startTransition(() => {
                setCursorX(event.clientX)
                setCursorY(event.clientY)
                setIsVisible(true)
            })
        }

        const onMouseOver = (event) => {
            const target = event.target
            const linkEl = target?.closest?.(
                "a, button, [role='menuitem'], [data-cursor-hover]"
            )
            startTransition(() => setIsOverLink(Boolean(linkEl)))
        }

        const onClick = () => {
            startTransition(() => setPulseCount((prev) => prev + 1))
        }

        const onMouseLeaveWindow = () => {
            startTransition(() => setIsVisible(false))
        }

        window.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseover", onMouseOver)
        document.addEventListener("click", onClick)
        document.addEventListener("mouseleave", onMouseLeaveWindow)

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseover", onMouseOver)
            document.removeEventListener("click", onClick)
            document.removeEventListener("mouseleave", onMouseLeaveWindow)
        }
    }, [canHover])

    if (!canHover || !isVisible) return null
    if (typeof document === "undefined") return null

    return createPortal(
        <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ scale: isOverLink ? 1.35 : 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
                position: "fixed",
                left: cursorX,
                top: cursorY,
                transform: "translate(-50%, -50%)",
                zIndex: 999999,
                pointerEvents: "none",
                // Sempre bianco + "difference": il colore risultante si inverte
                // rispetto a ciò che c'è sotto, quindi resta sempre leggibile
                // sia su sfondi scuri (video, home) sia chiari (pagina bianca
                // di /exhibitions) senza bisogno di sapere che pagina è.
                color: "#FFFFFF",
                mixBlendMode: "difference",
                fontSize: 17.6,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            <motion.span
                initial={false}
                animate={
                    isOverLink ? { scale: [1, 1.1, 1] } : { scale: 1 }
                }
                transition={{
                    duration: 0.85,
                    repeat: isOverLink ? Infinity : 0,
                    ease: "easeInOut",
                }}
                style={{ display: "inline-block" }}
            >
                <motion.span
                    key={pulseCount}
                    initial={false}
                    animate={
                        pulseCount > 0 ? { scale: [1, 1.22, 1] } : { scale: 1 }
                    }
                    transition={{ duration: 0.36, ease: "easeInOut" }}
                    style={{ display: "inline-block" }}
                >
                    ❥
                </motion.span>
            </motion.span>
        </motion.div>,
        document.body
    )
}
