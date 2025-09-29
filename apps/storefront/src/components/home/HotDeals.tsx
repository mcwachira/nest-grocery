"use client"
import { useEffect, useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/src/contexts/CartContext";
import { Product } from "@/src/lib/types";



const HotDeals = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 18, minutes: 54, seconds: 21 });
    const { addToCart } = useCart();

    const products: Product[] = [
        { id: 1, name: 'Premium Green Apple', price: 14.99, originalPrice: 20.99, image: '🍎', rating: 4, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true, sale: true },
        { id: 2, name: 'Fresh Orange', price: 20.99, image: '🍊', rating: 5, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },
        { id: 3, name: 'Chinese Cabbage', price: 12.99, image: '🥬', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
        { id: 4, name: 'Green Lettuce', price: 9.99, image: '🥬', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
        { id: 5, name: 'Eggplant', price: 34.99, image: '🍆', rating: 5, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
        { id: 6, name: 'Big Potatoes', price: 20.99, image: '🥔', rating: 3, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
        { id: 7, name: 'Sweet Corn', price: 20.99, image: '🌽', rating: 5, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
        { id: 8, name: 'Fresh Cauliflower', price: 12.99, image: '🥦', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true }
    ];

    const featuredProduct = products[0];


    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else if (prev.days > 0) {
                    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
    };

    return (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 right-20 w-48 h-48 bg-red-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
                        🔥 Hot Deals
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Limited time offers on your favorite products. Grab them before they're gone!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Featured Deal Card */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl">
                        <div className="text-center">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 lg:mb-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-5xl lg:text-6xl shadow-lg">
                                {featuredProduct.image}
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3 text-gray-800 dark:text-white">
                                {featuredProduct.name}
                            </h3>
                            <div className="flex items-center justify-center mb-4 lg:mb-6">
                                <span className="text-2xl lg:text-3xl font-bold text-red-600">${featuredProduct.price}</span>
                                <span className="text-gray-500 dark:text-gray-400 line-through ml-3 text-base lg:text-lg">${featuredProduct.originalPrice}</span>
                            </div>
                            <div className="flex justify-center mb-4 lg:mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 lg:h-3 mb-4 lg:mb-6 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full animate-pulse" style={{width: '78%'}}></div>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-4 lg:mb-6 font-medium">⏰ Offer ends in:</p>

                            <div className="grid grid-cols-4 gap-2 lg:gap-3 text-xs lg:text-sm mb-4 lg:mb-6">
                                {[
                                    { label: 'DAYS', value: timeLeft.days },
                                    { label: 'HOURS', value: timeLeft.hours },
                                    { label: 'MINS', value: timeLeft.minutes },
                                    { label: 'SECS', value: timeLeft.seconds }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-gray-800 dark:bg-gray-700 text-white p-2 lg:p-3 rounded-lg lg:rounded-xl text-center">
                                        <div className="text-base lg:text-xl font-bold">{item.value}</div>
                                        <div className="text-[10px] lg:text-xs opacity-75">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleAddToCart(featuredProduct)}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 lg:py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                                Grab This Deal
                            </button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
                            {products.slice(0, 6).map((product) => (
                                <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-xl dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="h-20 lg:h-24 flex items-center justify-center mb-3 lg:mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg lg:rounded-xl">
                                        <span className="text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {product.image}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-xs lg:text-sm line-clamp-2">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-green-600 dark:text-green-500 text-base lg:text-lg">${product.price}</span>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                            aria-label={`Add ${product.name} to cart`}
                                        >
                                            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HotDeals;