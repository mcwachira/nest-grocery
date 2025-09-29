"use client"
import {useState} from "react";
import {useRouter} from "next/navigation";
import BreadCrumbs from '@/src/components/common/BreadCrumbs';
import {useCart} from "@/src/contexts/CartContext.tsx";
import Newsletter from "@/src/components/common/NewsLetter.tsx";

const CartPage = () => {
    const router = useRouter();

    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const [couponCode, setCouponCode] = useState('');

    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const handleUpdateCart = () => {
        // Update cart logic (already handled by updateQuantity)
    };

    const handleReturnToShop = () => {
        router.push('/products');
    }

    const handleProceedToCheckout = () => {
        router.push('/checkout');
    };

    const handleApplyCoupon = () => {
        // Implement coupon logic
        console.log('Applying coupon:', couponCode);
    };

    return (
        <div className="min-h-screen bg-background">
            <BreadCrumbs items={[{ label: 'Shopping Cart' }]} />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">
                    My Shopping Cart
                </h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                        <p className="text-muted-foreground mb-6">Add some products to get started!</p>
                        <button
                            onClick={handleReturnToShop}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Return to shop
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2">

<div className="bg-card border border-border rounded-lg overflow-hidden">

    <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
        <tr>
            <th className="text-left py-4 px-6 font-semibold text-sm text-foreground">PRODUCT</th>
            <th className="text-center py-4 px-6 font-semibold text-sm text-foreground">PRICE</th>
            <th className="text-center py-4 px-6 font-semibold text-sm text-foreground">QUANTITY</th>
            <th className="text-center py-4 px-6 font-semibold text-sm text-foreground">SUBTOTAL</th>
            <th className="w-12"></th>
        </tr>
        </thead>
        <tbody>
        {cartItems.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
                <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl flex-shrink-0">{item.image}</div>
                        <div>
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                        </div>
                    </div>
                </td>
                <td className="text-center py-6 px-6">
                    <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
                </td>
                <td className="text-center py-6 px-6">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            −
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            +
                        </button>
                    </div>
                </td>
                <td className="text-center py-6 px-6">
                          <span className="font-bold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                </td>
                <td className="text-center py-6 px-6">
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                    >
                        ×
                    </button>
                </td>
            </tr>
        ))}
        </tbody>
    </table>
</div>
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={handleReturnToShop}
                                    className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                                >
                                    Return to shop
                                </button>
                                <button
                                    onClick={handleUpdateCart}
                                    className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                                >
                                    Update Cart
                                </button>
                            </div>


                            <div className="mt-8 bg-card border border-border rounded-lg p-6">
                                <h3 className="font-semibold text-foreground mb-4">Coupon Code</h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        Apply Coupon
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                                <h3 className="text-xl font-semibold text-foreground mb-6">Cart Total</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <span className="text-muted-foreground">Shipping:</span>
                                        <span className="font-semibold text-primary">Free</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-foreground font-semibold">Total:</span>
                                        <span className="text-xl font-bold text-foreground">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Proceed to checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Newsletter />
        </div>
    );
};

export default CartPage