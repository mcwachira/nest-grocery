"use client"
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/src/contexts/CartContext';
import BreadCrumbs from '@/src/components/common/BreadCrumbs';
import  Newsletter  from '@/src/components/common/NewsLetter';

interface BillingInfo {
    firstName: string;
    lastName: string;
    companyName?: string;
    streetAddress: string;
    country: string;
    states: string;
    zipCode: string;
    email: string;
    phone: string;
}

const CheckoutPage = () => {
    const router = useRouter();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [orderNotes, setOrderNotes] = useState('');
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [billingInfo, setBillingInfo] = useState<BillingInfo>({
        firstName: '',
        lastName: '',
        companyName: '',
        streetAddress: '',
        country: '',
        states: '',
        zipCode: '',
        email: '',
        phone: '',
    });

    const subtotal = getCartTotal();
    const shipping = 0;
    const total = subtotal + shipping;

    const handleInputChange = (field: keyof BillingInfo, value: string) => {
        setBillingInfo(prev => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = (e: FormEvent) => {
        e.preventDefault();

        if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.streetAddress ||
            !billingInfo.email || !billingInfo.phone || !billingInfo.country ||
            !billingInfo.states || !billingInfo.zipCode) {
            alert('Please fill in all required fields');
            return;
        }

        console.log('Order placed:', {
            billingInfo,
            paymentMethod,
            orderNotes,
            items: cartItems,
            total,
        });

        clearCart();
        alert('Order placed successfully!');
        router.push('/');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <BreadCrumbs items={[{ label: 'Shopping Cart' }, { label: 'Checkout' }]} />
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center py-12 bg-card border border-border rounded-lg">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                        <p className="text-muted-foreground mb-6">Add some products before checkout</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <BreadCrumbs items={[{ label: 'Shopping Cart' }, { label: 'Checkout' }]} />

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handlePlaceOrder}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Billing Information */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-6">Billing Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            First name
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Your first name"
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Last name
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Your last name"
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Company Name <span className="text-muted-foreground">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.companyName}
                                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                                            placeholder="Company name"
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        value={billingInfo.streetAddress}
                                        onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                                        placeholder="Street Address"
                                        required
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Country / Region
                                        </label>
                                        <select
                                            value={billingInfo.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select</option>
                                            <option value="US">United States</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="CA">Canada</option>
                                            <option value="KE">Kenya</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            States
                                        </label>
                                        <select
                                            value={billingInfo.states}
                                            onChange={(e) => handleInputChange('states', e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select</option>
                                            <option value="NY">New York</option>
                                            <option value="CA">California</option>
                                            <option value="TX">Texas</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Zip Code
                                        </label>
                                        <input
                                            type="text"
                                            value={billingInfo.zipCode}
                                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                            placeholder="Zip Code"
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={billingInfo.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Email Address"
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={billingInfo.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Phone number"
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="shipToDifferent"
                                        checked={shipToDifferentAddress}
                                        onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                                    />
                                    <label htmlFor="shipToDifferent" className="ml-2 text-sm text-foreground">
                                        Ship to a different address
                                    </label>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-foreground mb-6">Additional Info</h2>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Order Notes <span className="text-muted-foreground">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Notes about your order, e.g. special notes for delivery"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                                <h3 className="text-xl font-semibold text-foreground mb-6">Order Summery</h3>

                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="text-3xl flex-shrink-0">{item.image}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                            </div>
                                            <span className="font-semibold text-foreground text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Shipping:</span>
                                        <span className="font-semibold text-primary">Free</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <span className="text-foreground font-semibold">Total:</span>
                                        <span className="text-xl font-bold text-foreground">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold text-foreground mb-4">Payment Method</h4>

                                    <div className="space-y-3">
                                        <label className="flex items-center cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cash"
                                                checked={paymentMethod === 'cash'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-primary border-border focus:ring-primary"
                                            />
                                            <span className="ml-3 text-sm text-foreground">Cash on Delivery</span>
                                        </label>

                                        <label className="flex items-center cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="paypal"
                                                checked={paymentMethod === 'paypal'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-primary border-border focus:ring-primary"
                                            />
                                            <span className="ml-3 text-sm text-foreground">Paypal</span>
                                        </label>

                                        <label className="flex items-center cursor-pointer p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="amazon"
                                                checked={paymentMethod === 'amazon'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-primary border-border focus:ring-primary"
                                            />
                                            <span className="ml-3 text-sm text-foreground">Amazon Pay</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <Newsletter />
        </div>
    );
};

export default CheckoutPage;