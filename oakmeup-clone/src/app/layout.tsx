import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oakmeup.lt"),
  title: "Ąžuolinės grindys su montavimu visoje Lietuvoje | Oak Me Up",
  description:
    "Inžinerinės ąžuolo grindys su montavimu „iki rakto“ visoje Lietuvoje. Išsirinkite raštą, atspalvį ir apdailą. Tinka šildomoms grindims. Sąmata per 24 val.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "Ąžuolinės grindys su montavimu visoje Lietuvoje | Oak Me Up",
    description:
      "Inžinerinės ąžuolo grindys su montavimu „iki rakto“ visoje Lietuvoje. Išsirinkite raštą, atspalvį ir apdailą. Tinka šildomoms grindims. Sąmata per 24 val.",
    type: "website",
    url: "/",
    siteName: "Oak Me Up",
    images: [
      {
        url: "https://framerusercontent.com/assets/jiT1YFNMNqhI4O83E3Ip8NvkmO4.png",
        width: 1200,
        height: 630,
        alt: "Ąžuolinės grindys su montavimu visoje Lietuvoje | Oak Me Up",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ąžuolinės grindys su montavimu visoje Lietuvoje | Oak Me Up",
    description:
      "Inžinerinės ąžuolo grindys su montavimu „iki rakto“ visoje Lietuvoje. Išsirinkite raštą, atspalvį ir apdailą. Tinka šildomoms grindims. Sąmata per 24 val.",
    images: ["https://framerusercontent.com/assets/jiT1YFNMNqhI4O83E3Ip8NvkmO4.png"],
  },
  other: {
    llms:
      "Oak Me Up — inžinerinės ąžuolo grindys su montavimu iki rakto visoje Lietuvoje. Produktai: eglutė nuo 59€/m², chevron nuo 82€/m², Versalio panelės nuo 124€/m², parketlentės nuo 48€/m². Montavimas iki rakto — pagrindo paruošimas, STAUF klijai, Osmo apdaila, 2m. garantija. Sąmata per 24h. Tel: +37061569962. info@oakmeup.lt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Oak Me Up",
    alternateName: "Oak me up",
    url: "https://oakmeup.lt",
    telephone: "+37061569962",
    email: "edgaras@oakmeup.lt",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kauno g. 16",
      addressLocality: "Vilnius",
      postalCode: "LT-03212",
      addressCountry: "LT",
    },
    description:
      "Inžinerinės ąžuolo grindys su montavimu iki rakto viena kaina, vienas kontaktas, viena garantija.",
    priceRange: "€€",
    areaServed: "Lietuva",
    serviceType: ["Grindų montavimas", "Parketo klojimas", "Grindų šlifavimas"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Ar jūsų grindys tinka šildomoms grindims?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Taip. Visos mūsų grindys pagamintos su beržinės faneros pagrindu, kuris idealiai perduoda šilumą ir išlaiko stabilumą. Montavimą atliekame pagal UFH protokolą — su drėgmės matavimu, tinkamais klijais ir šildymo paleidimo seka.",
        },
      },
      {
        "@type": "Question",
        name: "Ką apima iki rakto kaina?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Viskas — grindys, klijai, gruntas, pagrindo paruošimas, montavimas ir apdaila alyva arba laku. Jokių papildomų kaštų. Gausite vieną sąmatą su galutine kaina.",
        },
      },
      {
        "@type": "Question",
        name: "Kiek kainuoja montavimas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Montavimo kaina priklauso nuo pasirinktos kolekcijos ir ploto. Orientacinės kainos su montavimu: parketlentės nuo 91 €/m², eglutė nuo 103 €/m², chevron nuo 126 €/m², Versalio panelės nuo 169 €/m². Tikslią kainą gausite sąmatoje per 24 val.",
        },
      },
      {
        "@type": "Question",
        name: "Per kiek laiko atliekamas montavimas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vidutiniškai 50-80 m² montuojame per 5-7 darbo dienas, įskaitant pagrindo paruošimą, montavimą ir apdailą. Tikslus terminas priklauso nuo kolekcijos, ploto ir pagrindo būklės.",
        },
      },
      {
        "@type": "Question",
        name: "Ar galiu gyventi bute montavimo metu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rekomenduojame montavimo metu nebūti patalpose — dėl dulkių ir apdailos medžiagų kvapo. Paprastai tai trunka 3-5 dienas. Galime derinti etapais, jei gyvenate tame pačiame būste.",
        },
      },
      {
        "@type": "Question",
        name: "Koks skirtumas tarp finished ir unfinished grindų?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Finished — gamykloje padengtos alyva arba laku, paruoštos naudojimui iškart. Unfinished — šlifuojamos ir apdailinamos vietoje po montavimo. Unfinished leidžia pritaikyti spalvą pagal jūsų interjerą — tai mūsų rekomenduojamas variantas.",
        },
      },
      {
        "@type": "Question",
        name: "Kaip prižiūrėti ąžuolo grindis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kasdienei priežiūrai pakanka sauso arba drėgno šluostymo. Rekomenduojame Osmo priežiūros priemones. Alyva dengtus paviršius rekomenduojama atnaujinti kas 3-5 metus, be viso grindų šlifavimo.",
        },
      },
    ],
  };

  return (
    <html lang="lt" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-92VP26W85G" strategy="afterInteractive" />
        <Script id="gtag-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-92VP26W85G');`}
        </Script>
        <Script id="clarity-config" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w0pi7l7574");`}
        </Script>
        <Script id="contentsquare-config" src="https://t.contentsquare.net/uxa/560b57c350a8d.js" strategy="afterInteractive" />
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`_linkedin_partner_id = "8320169";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src="https://px.ads.linkedin.com/collect/?pid=8320169&fmt=gif" />
        </noscript>
        <Script
          id="schema-localbusiness"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
