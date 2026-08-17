import { useEffect, useState, startTransition } from "react"

// --- HEADER CONDIVISO PER LE PAGINE SECONDARIE ---
// Estratto da ExhibitionsGallery.jsx e reso un componente a se' stante
// cosi' che "CLAUDIA MANGONE" resti SEMPRE nello stesso identico punto
// (stessa altezza dall'alto, stesso font-size) su ogni pagina secondaria
// che lo monta: /exhibitions oggi, /selected-works, /contact, /clouds
// quando verranno create.
//
// Uso:
//   <PageHeader centerLabel="EXHIBITIONS" />
//   <PageHeader centerLabel="CONTACT" />
//   <PageHeader />  // senza etichetta centrale, se una pagina non ne ha bisogno

const FONT_FAMILY = "Inter, Helvetica, Arial, sans-serif"
const COLOR_BLACK = "#000000"

export default function PageHeader({ centerLabel }) {
    const [isPhone, setIsPhone] = useState(false)

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

    const horizontalGutter = isPhone ? 16 : 48
    const headerHeight = isPhone ? 72 : 100
    // Testo piu' in alto rispetto a prima: non piu' centrato verticalmente
    // nella fascia header, ma ancorato vicino al bordo superiore con un
    // piccolo padding fisso. Essendo lo stesso valore per ogni pagina che
    // monta questo componente, il punto resta identico ovunque.
    const headerTopOffset = isPhone ? 20 : 26

    // Font piu' grande di un punto rispetto a prima (13/15 -> 14/16).
    const navLinkStyle = {
        textDecoration: "none",
        color: COLOR_BLACK,
        textTransform: "uppercase",
        letterSpacing: "0.7px",
        fontFamily: FONT_FAMILY,
        fontWeight: 500,
        fontSize: isPhone ? 14 : 16,
        cursor: "pointer",
        pointerEvents: "auto",
    }

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: headerHeight,
                paddingLeft: horizontalGutter,
                paddingRight: horizontalGutter,
                boxSizing: "border-box",
                zIndex: 10,
                pointerEvents: "none",
            }}
        >
            <a
                href="/"
                style={{
                    ...navLinkStyle,
                    position: "absolute",
                    left: horizontalGutter,
                    top: headerTopOffset,
                }}
            >
                CLAUDIA MANGONE
            </a>

            {centerLabel ? (
                <div
                    style={{
                        ...navLinkStyle,
                        position: "absolute",
                        left: "52%",
                        top: headerTopOffset,
                        transform: "translateX(-50%)",
                        cursor: "default",
                    }}
                >
                    {centerLabel}
                </div>
            ) : null}
        </header>
    )
}

// Altezza della fascia header, da riusare nelle pagine che montano
// PageHeader per calcolare il paddingTop del contenuto sottostante
// (stessa logica gia' usata prima in ExhibitionsGallery.jsx).
export function usePageHeaderHeight(isPhone) {
    return isPhone ? 72 : 100
}
