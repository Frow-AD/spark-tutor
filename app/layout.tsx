import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Spark — Your Learning Buddy",
  description: "A friendly Socratic AI tutor for K-5 students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Spark",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-gradient-to-br from-blue-50 to-yellow-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
