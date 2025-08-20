import type React from "react"
import type { Metadata } from "next"
import { Source_Sans_3, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "AI Assistant Pro",
  description: "Professional AI Assistant Chatbot",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${playfairDisplay.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
