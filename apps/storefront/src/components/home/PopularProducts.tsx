'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
    Star,
    ShoppingCart,
    Heart,
    Eye,
    ArrowRight,
    X,
    Plus,
    Minus,
    Share2
} from "lucide-react";
import { useCart } from '@/src/contexts/CartContext';
import { Product } from '@/src/lib/types';
import { allProducts } from '@/src/lib/data';

const PopularProducts = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const router = useRouter();
    const { addToCart } = useCart();

    const products = allProducts.slice(0, 8);

    const productImages = ['🍎', '🍏', '🍎', '🍏'];

    const openQuickView = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setSelectedImage(0);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickView = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    const handleAddToCart = (product: Product, qty: number = 1) => {
        for (let i = 0; i < qty; i++) {
            addToCart(product);
        }
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeQuickView();
        };

        if (selectedProduct) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [selectedProduct]);

    return (
        <>
            <section className="py-16 lg:py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-12 lg:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
                            Featured Products
                        </h2>
                        <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Handpicked selection of the freshest and highest quality organic products
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 mb-8 lg:mb-12">
                        {products.map((product) => (
                            <div key={product.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:shadow-2xl dark:hover:shadow-gray-900/40 transition-all duration-500 hover:-translate-y-2 lg:hover:-translate-y-3 relative overflow-hidden">
                                {product.sale && (
                                    <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 lg:px-3 lg:py-1 rounded-full text-[10px] lg:text-xs font-bold z-10 animate-pulse">
                                        SALE 50%
                                    </div>
                                )}

                                <div className="relative h-32 lg:h-40 mb-4 lg:mb-6 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg lg:rounded-xl overflow-hidden">
                                    <div className="text-4xl lg:text-6xl group-hover:scale-110 transition-transform duration-300">
                                        {product.image}
                                    </div>

                                    <div className="absolute top-2 right-2 lg:top-3 lg:right-3 flex flex-col gap-1 lg:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button className="w-8 h-8 lg:w-10 lg:h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors duration-200">
                                            <Heart className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </button>
                                        <button
                                            onClick={() => openQuickView(product)}
                                            className="w-8 h-8 lg:w-10 lg:h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition-colors duration-200"
                                        >
                                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 dark:text-white mb-2 lg:mb-3 text-sm lg:text-lg line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                                    {product.name}
                                </h3>

                                <div className="flex items-center mb-3 lg:mb-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 lg:w-4 lg:h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 ml-1 lg:ml-2">({product.rating}.0)</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">${product.price}</span>
                                        {product.originalPrice && (
                                            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 line-through">${product.originalPrice}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-2 lg:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                                        aria-label={`Add ${product.name} to cart`}
                                    >
                                        <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/products" className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group text-sm lg:text-base">
                            View All Products
                            <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick View Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={closeQuickView}
                    ></div>

                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transform transition-all">
                            <button
                                onClick={closeQuickView}
                                className="absolute top-3 right-3 lg:top-4 lg:right-4 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                                <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6 xl:p-8">
                                {/* Product Images */}
                                <div className="space-y-3 lg:space-y-4">
                                    <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg lg:rounded-xl flex items-center justify-center">
                                        <div className="text-6xl lg:text-8xl">
                                            {productImages[selectedImage]}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 lg:gap-3">
                                        {productImages.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg flex items-center justify-center text-xl lg:text-2xl transition-all duration-200 ${
                                                    selectedImage === index
                                                        ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {img}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="space-y-4 lg:space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 lg:gap-3 mb-2">
                                            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 dark:text-white">
                                                {selectedProduct.name}
                                            </h1>
                                            <span className="px-2 lg:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs lg:text-sm font-medium">
                                                In Stock
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 lg:w-5 lg:h-5 ${i < selectedProduct.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                ))}
                                            </div>
                                            <span className="text-sm lg:text-base text-gray-600 dark:text-gray-400">4 Review</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <span className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                                            ${selectedProduct.price}
                                        </span>
                                        {selectedProduct.originalPrice && (
                                            <>
                                                <span className="text-lg lg:text-xl text-gray-400 line-through">
                                                    ${selectedProduct.originalPrice}
                                                </span>
                                                <span className="px-2 lg:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs lg:text-sm font-medium">
                                                    64% Off
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec.
                                    </p>

                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <button
                                                onClick={decrementQuantity}
                                                className="p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                            >
                                                <Minus className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <span className="px-3 lg:px-4 py-2 lg:py-3 font-medium text-gray-800 dark:text-white border-x border-gray-300 dark:border-gray-600 min-w-[3rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="p-2 lg:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                            >
                                                <Plus className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleAddToCart(selectedProduct, quantity);
                                                closeQuickView();
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm lg:text-base"
                                        >
                                            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                                            Add to Cart
                                        </button>

                                        <button className="p-2 lg:p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200">
                                            <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 lg:space-y-3 text-sm lg:text-base">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <Link href={`/category/${selectedProduct.categorySlug}`} className="text-green-600 dark:text-green-400 hover:underline">
                                                {selectedProduct.category}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PopularProducts;