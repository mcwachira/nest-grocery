import {ThemeProvider} from "@/src/components/theme/ThemeProvider.tsx";
import {Toaster} from "@/src/components/ui/sonner.tsx";


export async function AppProviders({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

                {children}

                <Toaster />

        </ThemeProvider>
    )