"use client"
import {X} from "lucide-react"

import { useRouter } from 'next/navigation';
import {useCart} from "@/src/contexts/CartContext.tsx";

interface CartPopupProps {
    isOpen: boolean;
    onClose: () => void;
}


const CartPopup = ({isOpen, onClose} :CartPopupProps) => {
    const {cartItems, updateQuantity, removeFromCart, getCartTotal} = useCart();
    const router = useRouter();

    if(!isOpen) return null;

    const handleCheckout =  () => {

        onClose()
        router.push("/checkout")
    }

    const handleGoToCart = () => {
        onClose();
        router.push('/cart');
    };
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div className="relative bg-background w-full max-w-md h-full shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        Shopping Card ({cartItems.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛒</div>
                            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                            <p className="text-muted-foreground">Add some products to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                                    <div className="text-4xl flex-shrink-0">{item.image}</div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground truncate mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            1 kg × <span className="font-semibold text-foreground">{item.quantity}</span>
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-foreground">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-xs text-destructive hover:underline mt-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-border p-6 space-y-4">
                        <div className="flex items-center justify-between text-lg font-semibold">
                            <span className="text-foreground">2 Product</span>
                            <span className="text-foreground">${getCartTotal().toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Checkout
                        </button>

                        <button
                            onClick={handleGoToCart}
                            className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                        >
                            Go To Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPopup;