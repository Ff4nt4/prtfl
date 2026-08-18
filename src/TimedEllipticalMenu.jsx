import React, { useState, useEffect, useRef, useCallback, startTransition } from "react"
import HoverGlowLink from "./HoverGlowLink.jsx"

/**
 * TimedEllipticalMenu Component
 * Optimized for desktop & mobile device orientation / auto-playing inline video reels.
 */

const FONT_FAMILY = "Inter, Helvetica, Arial, sans-serif"

export default function TimedEllipticalMenu({
    textColor = "#FFFFFF",
    markerColor = "#FFFFFF",
    fontSize = 18,
    markerWidth = 14,
}) {
    const [isPhone, setIsPhone] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        if (typeof window === "undefined") return
        const checkPhone = () => {
            startTransition(() => {
                setIsPhone(window.innerWidth <= 768 || window.innerHeight <= 500)
            })
        }
        checkPhone()
        window.addEventListener("resize", checkPhone)
        return () => window.removeEventListener("resize", checkPhone)
    }, [])

    // Ensure mobile inline video autoplay works reliably
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true
            videoRef.current.muted = true
            videoRef.current.playsInline = true
            const playPromise = videoRef.current.play()
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.log("Autoplay caught/prevented:", err)
                })
            }
        }
    }, [])

    const topMargin = isPhone ? 20 : 36
    const edgeMargin = isPhone ? 16 : 48
    const fontSizeHeader = isPhone ? 16 : 18

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#000" }}>
            {/* Background Video Reel */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
                preload="auto"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            >
                <source src="/reel.mp4" type="video/mp4" />
                <source src="/reel.webm" type="video/webm" />
            </video>

            {/* Header Overlay */}
            <header
                style={{
                    position: "fixed",
                    top: topMargin,
                    left: edgeMargin,
                    right: edgeMargin,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 10,
                    fontFamily: FONT_FAMILY,
                }}
            >
                <HoverGlowLink
                    href="/"
                    baseColor={textColor}
                    style={{
                        fontSize: fontSizeHeader,
                        fontWeight: 600,
                        letterSpacing: "1px",
                        textDecoration: "none",
                        color: textColor,
                    }}
                >
                    CLAUDIA MANGONE
                </HoverGlowLink>

                <nav style={{ display: "flex", gap: isPhone ? 16 : 32 }}>
                    <HoverGlowLink
                        href="/exhibitions"
                        baseColor={textColor}
                        style={{
                            fontSize: fontSizeHeader,
                            fontWeight: 500,
                            letterSpacing: "0.7px",
                            textDecoration: "none",
                            color: textColor,
                            textTransform: "uppercase"
                        }}
                    >
                        EXHIBITIONS
                    </HoverGlowLink>
                    <HoverGlowLink
                        href="/selected-works"
                        baseColor={textColor}
                        style={{
                            fontSize: fontSizeHeader,
                            fontWeight: 500,
                            letterSpacing: "0.7px",
                            textDecoration: "none",
                            color: textColor,
                            textTransform: "uppercase"
                        }}
                    >
                        SELECTED WORKS
                    </HoverGlowLink>
                    <HoverGlowLink
                        href="/contact"
                        baseColor={textColor}
                        style={{
                            fontSize: fontSizeHeader,
                            fontWeight: 500,
                            letterSpacing: "0.7px",
                            textDecoration: "none",
                            color: textColor,
                            textTransform: "uppercase"
                        }}
                    >
                        CONTACT
                    </HoverGlowLink>
                </nav>
            </header>
        </div>
    )
}
