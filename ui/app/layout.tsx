import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ShirtCo Demo - OCN 8-Agent Integration',
    description: 'Demonstrates end-to-end B2B apparel transaction flow across all 8 OCN agents',
    keywords: ['OCN', 'Open Checkout Network', 'ShirtCo', 'B2B', 'FinTech', 'Demo'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    {children}
                </div>
            </body>
        </html>
    )
}
