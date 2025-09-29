import {ThemeProvider} from "@/src/components/theme/ThemeProvider.tsx";
import {Toaster} from "@/src/components/ui/sonner.tsx";
import {CartProvider} from "@/src/contexts/CartContext.tsx";
import CartPopup from "@/src/components/cart/CartPopup.tsx";
import {WishlistProvider} from "@/src/contexts/WishlistContext.tsx";

function CartPopupWrapper() {
    const { isCartOpen, closeCart } = useCart();

    return <CartPopup isOpen={isCartOpen} onClose={closeCart} />;
}

export async function AppProviders({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

            <CartProvider>


                <WishlistProvider>
                    {children}
                    <Toaster/>
                    <CartPopupWrapper />
                </WishlistProvider>


            </CartProvider>
        </ThemeProvider>
    )
}