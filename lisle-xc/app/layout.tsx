import "./globals.css"

import { Metadata } from "next";

import { getBackgroundImages } from '@/lib/getBackground';
import { Background } from '@/components/Background';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { Montserrat, Source_Sans_3 } from 'next/font/google';

// Primary Heading & Headline Font: Montserrat
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Primary Content Font: Source Sans Pro (Source Sans 3 is the updated version)
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lislexc.com'),

  // Standard SEO
  title: {
    template: 'Lisle Cross Country :: %s',
    default: 'Lisle Cross Country :: Home',
  },
  description: 'News and homepage for the Lisle cross country team. Stay updated with the latest news, schedules, and results.',
  
  // Canonical URL
  alternates: {
    canonical: '/',
  },

  // Open Graph (For when links are texted or posted on Facebook/Twitter)
  openGraph: {
    title: 'Lisle Cross Country – Official Team Website',
    description: 'Stay updated with the latest news, schedules, and results of the Lisle Cross Country team.',
    url: '/',
    siteName: 'Lisle Cross Country',
    images: [
      {
        url: '/images/lions.jpg', 
        width: 1200,
        height: 630,
        alt: 'Lisle Cross Country Team',
      },
    ],
    type: 'website',
  },

icons: {
    icon: '/favicon-96x96.png',
    apple: '/apple-touch-icon.png',
  },
  
  appleWebApp: {
    title: 'Lisle XC',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({children,}: {children: React.ReactNode;}) {
  const images = getBackgroundImages();

  return (
    <html lang="en" className={`${montserrat.variable} ${sourceSans.variable}`}>
      <body className="antialiased font-body overflow-x-hidden">
        
        {/* Fixed Background */}
        <Background availableImages={images} />
        
        {/* Global Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          
          {/* A generic <main> tag that stretches to fill the screen. 
            We leave the specific sizing and grids to the individual pages.
          */}
          <main className="grow flex flex-col w-full">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}