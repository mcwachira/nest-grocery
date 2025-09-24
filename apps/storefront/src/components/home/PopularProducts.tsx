
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
    Star,
    ShoppingCart,
    Heart,
    Eye,
    ArrowRight,
    Calendar,
    MessageCircle,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Quote
} from "lucide-react";

// 4. Enhanced Popular Products
const PopularProducts = () => {
    const products = [
        { id: 1, name: 'Premium Green Apple', price: 14.99, originalPrice: 20.99, emoji: '🍎', rating: 4, inStock: true, sale: true },
        { id: 2, name: 'Fresh Valencia Orange', price: 20.99, emoji: '🍊', rating: 5, inStock: true },
        { id: 3, name: 'Organic Chinese Cabbage', price: 12.99, emoji: '🥬', rating: 4, inStock: true },
        { id: 4, name: 'Crisp Green Lettuce', price: 9.99, emoji: '🥬', rating: 4, inStock: true },
        { id: 5, name: 'Fresh Eggplant', price: 34.99, emoji: '🍆', rating: 5, inStock: true },
        { id: 6, name: 'Organic Potatoes', price: 20.99, emoji: '🥔', rating: 3, inStock: true },
        { id: 7, name: 'Sweet Corn', price: 20.99, emoji: '🌽', rating: 5, inStock: true },
        { id: 8, name: 'Fresh Cauliflower', price: 12.99, emoji: '🥦', rating: 4, inStock: true }
    ];

    return (
        <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                        Featured Products
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Handpicked selection of the freshest and highest quality organic products
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
                    {products.slice(0, 8).map((product) => (
                        <div key={product.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-2xl dark:hover:shadow-gray-900/40 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                            {product.sale && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 animate-pulse">
                                    SALE 50%
                                </div>
                            )}

                            <div className="relative h-40 mb-6 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
                                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                                    {product.emoji}
                                </div>

                                {/* Enhanced Hover Actions */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors duration-200">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <button className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition-colors duration-200">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-lg line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                                {product.name}
                            </h3>

                            <div className="flex items-center mb-4">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({product.rating}.0)</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white">${product.price}</span>
                                    {product.originalPrice && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">${product.originalPrice}</span>
                                    )}
                                </div>
                                <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group">
                        View All Products
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
    export default PopularProducts