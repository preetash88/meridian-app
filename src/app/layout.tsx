import type {Metadata, Viewport} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import {Providers} from "@/components/Providers";
import {SITE} from "@/lib/site";
import {ScrollProgress} from "@/components/ScrollProgress";

const display = localFont({
    src: "./fonts/bricolage.woff2",
    variable: "--f-display",
    weight: "200 800",
    display: "swap"
});
const body = localFont({src: "./fonts/instrument.woff2", variable: "--f-body", weight: "400 700", display: "swap"});

export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}`},
    description: SITE.description,
    applicationName: SITE.name,
    openGraph: {
        type: "website",
        siteName: SITE.name,
        locale: "en_AU",
        title: `${SITE.name}: ${SITE.tagline}`,
        description: SITE.description,
    },
    twitter: {card: "summary_large_image"},
    alternates: {canonical: "/"},
};

export const viewport: Viewport = {
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#f3f5f3"},
        {media: "(prefers-color-scheme: dark)", color: "#08171f"},
    ],
    width: "device-width",
    initialScale: 1,
};

// Runs before first paint so the page never flashes the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    areaServed: {"@type": "Country", name: "Australia"},
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en-AU" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{__html: themeInit}}/>
        </head>
        <body>
        <script type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")}}/>
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-chalk"
        >
            Skip to content
        </a>
        <div className="aurora" aria-hidden="true">
            <div className="aurora-blob a"/>
            <div className="aurora-blob b"/>
            <div className="aurora-blob c"/>
        </div>
        <Providers>
            <ScrollProgress/>
            <Header/>
            <main id="main">{children}</main>
            <Footer/>
        </Providers>
        </body>
        </html>
    );
}
