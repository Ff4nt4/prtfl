import { useCallback, useEffect, useState, startTransition } from "react"
import { motion } from "framer-motion"

// --- EFFETTO HOVER CONDIVISO PER I LINK ATTIVI DELLE PAGINE SECONDARIE ---
// Stesso identico effetto gia' usato nel menu ellittico della home
// (TimedEllipticalMenu.jsx) quando il cursore passa sopra una voce:
//   - il testo ruota su se stesso attorno all'asse orizzontale (rotateX)
//   - il colore passa al verde "#A6FF00" con un bagliore (textShadow)
// Estratto qui come componente riutilizzabile cosi' da poterlo applicare
// a "CLAUDIA MANGONE" (in PageHeader.jsx, quindi su ogni pagina
// secondaria), all'etichetta centrale dell'header (es. "CONTACT") e ai
// link email/Instagram nella pagina Contatti, senza duplicare la logica.
//
// Uso:
//   <HoverGlowLink href="/">CLAUDIA MANGONE</HoverGlowLink>
//   <HoverGlowLink as="div">CONTACT</HoverGlowLink>
//   <HoverGlowLink href="mailto:..." baseColor="rgba(0,0,0,0.7)">...</HoverGlowLink>

const HOVER_COLOR = "#A6FF00"
const GLOW_TEXT_SHADOW = "0 0 10px rgba(166, 255, 0, 0.55)"
const NO_TEXT_SHADOW = "0 0 0 rgba(0, 0, 0, 0)"

export default function HoverGlowLink({
    as: Component = "a",
    baseColor = "#000000",
    style,
    children,
    onClick,
    // Se true, su smartphone (assenza di hover reale) il link esegue da
    // solo l'effetto rotazione+glow ogni 3 secondi, alternandosi con lo
    // stato normale - usato in ContactsPage.jsx per email/Instagram, dove
    // altrimenti l'hover (che su touch non esiste) non farebbe mai vedere
    // l'effetto.
    autoAnimatePhone = false,
    ...rest
}) {
    const [canHover, setCanHover] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [twistCount, setTwistCount] = useState(0)
    const [autoActive, setAutoActive] = useState(false)

    // Rileva se il dispositivo ha davvero un mouse (hover reale): su touch
    // l'effetto di rotazione/bagliore al passaggio del dito non ha senso,
    // stessa logica gia' usata in TimedEllipticalMenu.jsx e CustomCursor.jsx.
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

    // Animazione automatica ogni 3s, solo su dispositivi senza hover reale
    // (smartphone) e solo se richiesta esplicitamente (autoAnimatePhone).
    useEffect(() => {
        if (!autoAnimatePhone) return
        if (canHover) return
        if (typeof window === "undefined") return
        const intervalId = window.setInterval(() => {
            startTransition(() => {
                setAutoActive((prev) => !prev)
                setTwistCount((prev) => prev + 1)
            })
        }, 3000)
        return () => window.clearInterval(intervalId)
    }, [autoAnimatePhone, canHover])

    const handleEnter = useCallback(() => {
        if (!canHover) return
        startTransition(() => {
            setIsHovered(true)
            setTwistCount((prev) => prev + 1)
        })
    }, [canHover])

    const handleLeave = useCallback(() => {
        if (!canHover) return
        startTransition(() => setIsHovered(false))
    }, [canHover])

    // Il click fa comunque ruotare il testo (funziona anche su touch,
    // per questo non e' vincolato a canHover) - stesso comportamento di
    // handleLabelClick nel menu della home.
    const handleClick = useCallback(
        (event) => {
            setTwistCount((prev) => prev + 1)
            if (onClick) onClick(event)
        },
        [onClick]
    )

    // Attivo (colore verde + glow) quando: c'e' hover reale ed e' in
    // hover, OPPURE quando l'animazione automatica su smartphone e' nella
    // sua fase "accesa".
    const isGlowActive =
        (isHovered && canHover) || (autoAnimatePhone && !canHover && autoActive)

    return (
        <Component
            {...rest}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={handleClick}
            // data-cursor-hover: fa si' che anche il cursore custom a cuore
            // (CustomCursor.jsx) reagisca ingrandendosi su questo elemento,
            // anche quando non e' un vero tag <a> (es. l'etichetta centrale).
            data-cursor-hover=""
            style={{
                ...style,
                // Necessario perche' il rotateX del testo sia un vero giro
                // 3D e non un semplice schiacciamento verticale piatto
                // (stessa necessita' del perspective sull'<a> del menu home).
                perspective: 700,
            }}
        >
            <motion.span
                initial={false}
                animate={{
                    rotateX: twistCount * 360,
                    color: isGlowActive ? HOVER_COLOR : baseColor,
                    textShadow: isGlowActive ? GLOW_TEXT_SHADOW : NO_TEXT_SHADOW,
                }}
                transition={{
                    rotateX: { duration: 0.75, ease: "easeInOut" },
                    color: { duration: 1.15, ease: "easeInOut" },
                    textShadow: { duration: 1.15, ease: "easeInOut" },
                }}
                style={{ display: "inline-block", transformStyle: "preserve-3d" }}
            >
                {children}
            </motion.span>
        </Component>
    )
}
