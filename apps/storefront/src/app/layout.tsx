import "./styles.css";
import Header from "@/src/components/Header/header.tsx";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

      <Header />
      {children}</body>
    </html>
  );
}
