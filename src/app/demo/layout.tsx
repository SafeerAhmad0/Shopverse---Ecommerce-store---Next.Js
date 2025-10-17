import "@/app/css/style.css";

export const metadata = {
  title: 'Minimal Store Demo',
  description: 'Beautiful minimal store with real products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
