import React, { useEffect, useState, startTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * OrientationGuard:
 * - Detects mobile device / small screens in portrait mode.
 * - Displays a full-screen overlay prompting the user to rotate the device 180° / to landscape.
 * - Requests Fullscreen mode on touch / tap if supported.
 * - Shows an interactive rotation animation.
 */
export default function OrientationGuard({ children }) {
    const [isMobilePortrait, setIsMobilePortrait] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const checkOrientation = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            const mobileDevice = width <= 960 || height <= 600 || ('ontouchstart' in window)
            const portrait = height > width

            startTransition(() => {
                setIsMobile(mobileDevice)
                setIsMobilePortrait(mobileDevice && portrait)
            })
        }

        checkOrientation()
        window.addEventListener("resize", checkOrientation)
        window.addEventListener("orientationchange", checkOrientation)

        return () => {
            window.removeEventListener("resize", checkOrientation)
            window.removeEventListener("orientationchange", checkOrientation)
        }
    }, [])

    const requestFullscreen = () => {
        const docEl = document.documentElement
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {})
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen()
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen()
        }
    }

    return (
        <>
            <AnimatePresence>
                {isMobilePortrait && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        onClick={requestFullscreen}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999999,
                            backgroundColor: "#000000",
                            color: "#FFFFFF",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "24px",
                            textAlign: "center",
                            fontFamily: "Inter, Helvetica, Arial, sans-serif",
                            userSelect: "none",
                            cursor: "pointer"
                        }}
                    >
                        {/* Smartphone Rotation Animation */}
                        <motion.div
                            animate={{ rotate: [0, -90, -90, 0] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatDelay: 0.8
                            }}
                            style={{
                                width: 50,
                                height: 90,
                                border: "3px solid #FFFFFF",
                                borderRadius: 12,
                                marginBottom: 32,
                                position: "relative",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            {/* Inner Screen representation */}
                            <div
                                style={{
                                    width: 36,
                                    height: 70,
                                    border: "1px dashed rgba(255, 255, 255, 0.4)",
                                    borderRadius: 6
                                }}
                            />
                            {/* Screen Rotation Arrow / Icon */}
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    position: "absolute",
                                    fontSize: 18,
                                    color: "#A6FF00"
                                }}
                            >
                                ↺
                            </motion.span>
                        </motion.div>

                        <h2
                            style={{
                                fontSize: 18,
                                textTransform: "uppercase",
                                letterSpacing: "1.2px",
                                fontWeight: 500,
                                margin: "0 0 12px 0"
                            }}
                        >
                            RUOTA LO SCHERMO
                        </h2>
                        <p
                            style={{
                                fontSize: 13,
                                opacity: 0.75,
                                maxWidth: 280,
                                lineHeight: 1.4,
                                margin: 0,
                                fontWeight: 400
                            }}
                        >
                            Per fruire dell'esperienza completa, ruota il dispositivo in modalità orizzontale (Landscape).
                        </p>
                        <span
                            style={{
                                marginTop: 24,
                                fontSize: 11,
                                letterSpacing: "0.8px",
                                opacity: 0.4,
                                textTransform: "uppercase"
                            }}
                        >
                            Tocca per attivare lo schermo intero
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    )
}
