import {ThemeProvider} from "@/src/components/theme/ThemeProvider.tsx";
import {Toaster} from "@/src/components/ui/sonner.tsx";
import {CartProvider} from "@/src/contexts/CartContext.tsx";


export async function AppProviders({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

            <CartProvider>


            {children}

            <Toaster/>
            </CartProvider>
        </ThemeProvider>
    )
}