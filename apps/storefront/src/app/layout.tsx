import "./styles.css";
import Header from "@/src/components/Header/header.tsx";
import Footer from "@/src/components/Footer.tsx";
import {ThemeProvider} from "@/src/components/theme/ThemeProvider.tsx";
import {ToasterClient} from "@/src/components/toast-client.tsx";
import {AppProviders} from "@/src/app/providers.tsx";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
      <AppProviders>
          <Header />
          {children}
          <Footer/>
      </AppProviders>

      </body>
      </html>
  );
}


