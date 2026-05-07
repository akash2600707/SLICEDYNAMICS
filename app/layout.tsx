import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SliceDynamics — Custom 3D Printing",
  description:
    "Design, prototype, and manufacture custom products using advanced 3D printing technology.",
  openGraph: {
    title: "SliceDynamics — Custom 3D Printing",
    description: "Upload your 3D file, get an instant estimate, and we'll manufacture it for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0e0e12] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
