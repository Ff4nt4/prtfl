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
