import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consumables - Horror Supermarket Game',
  description: 'An immersive horror game where you explore a twisted supermarket world and uncover sinister secrets.',
  keywords: ['horror game', 'supermarket', 'adventure', 'puzzle', 'horror experience', 'interactive'],
  openGraph: {
    title: 'Consumables - Horror Supermarket Game',
    description: 'Enter a twisted supermarket world and face unknown threats.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function ConsumablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
