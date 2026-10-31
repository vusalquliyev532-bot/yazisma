import "./globals.css";

export const metadata = {
  title: "Yazışma",
  description: "Sadə, şəkilsiz yazışma proqramı",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1f24",
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
