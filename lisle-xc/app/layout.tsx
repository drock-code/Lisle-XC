import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Apply the variables to the <html> tag so they are available globally
    <html lang="en" className={`${montserrat.variable} ${sourceSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}