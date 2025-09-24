'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Leaf,
    ShoppingBag,
    Star,
    Truck,
    Heart,
    Eye,
    CreditCard,
    Headphones,
    RefreshCw,
    Shield,
    Calendar,
    MessageCircle,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Quote
} from "lucide-react";

// Import your images
import HeroImage from "@/src/assets/hero-woman.png";

// 1. Enhanced Hero Section
const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 dark:from-green-600 dark:via-green-700 dark:to-green-800">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-yellow-300 rounded-full"></div>
                <div className="absolute bottom-32 left-1/3 w-16 h-16 bg-orange-300 rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 py-16 lg:py-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px]">
                    {/* Enhanced Left Content */}
                    <div className={`space-y-8 text-center lg:text-left transition-all duration-1000 ${
                        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                    }`}>
                        {/* Premium Badge */}
                        <div className="inline-flex items-center space-x-3 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white border border-white/20">
                            <Leaf className="w-5 h-5" />
                            <span className="font-medium">100% Organic & Fresh</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>

                        {/* Enhanced Heading */}
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.9]">
                                Fresh & Healthy
                                <br />
                                <span className="text-yellow-300 dark:text-yellow-400 relative">
                                    Organic Food
                                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-300/50 rounded-full"></div>
                                </span>
                            </h1>

                            {/* Enhanced Sale Banner */}
                            <div className="flex items-center justify-center lg:justify-start space-x-4 flex-wrap gap-2">
                                <div className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transition-shadow">
                                    Sale up to 30% OFF
                                </div>
                                <div className="hidden sm:flex items-center space-x-2 text-white/90 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                                    <Star className="w-4 h-4 fill-current text-yellow-300" />
                                    <span className="text-sm font-medium">Premium Quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Subtitle */}
                        <p className="text-xl lg:text-2xl text-white/90 dark:text-white/80 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                            Free shipping on all orders. Get fresh, organic produce delivered right to your doorstep within 24 hours.
                        </p>

                        {/* Enhanced Features List */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            {[
                                { icon: Truck, text: "Free Delivery" },
                                { icon: Leaf, text: "100% Natural" },
                                { icon: ShoppingBag, text: "Fresh Daily" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                            <Link href="/shop" className="group bg-white dark:bg-gray-100 text-green-600 dark:text-green-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                                <span>Shop Now</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>

                            <Link href="/categories" className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:shadow-xl">
                                <span>Browse Categories</span>
                            </Link>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                            {[
                                { number: "1000+", label: "Happy Customers" },
                                { number: "500+", label: "Fresh Products" },
                                { number: "24/7", label: "Support" }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center group">
                                    <div className="text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-white/80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Right Content */}
                    <div className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
                        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                    }`}>
                        <div className="relative w-full max-w-lg lg:max-w-xl">
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm p-8 border border-white/20">
                                <div className="w-full h-full rounded-2xl relative overflow-hidden shadow-2xl">
                                    <Image
                                        src={HeroImage}
                                        alt="Fresh organic food with woman holding vegetables"
                                        fill
                                        className="object-cover rounded-2xl hover:scale-105 transition-transform duration-700"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            </div>

                            {/* Enhanced Floating Elements */}
                            <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                                <span className="text-3xl">🍇</span>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                                <span className="text-4xl">🥕</span>
                            </div>
                            <div className="absolute top-1/4 -right-10 w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center shadow-xl animate-bounce delay-300">
                                <span className="text-2xl">🍅</span>
                            </div>
                            <div className="absolute bottom-1/4 -left-10 w-18 h-18 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-xl animate-pulse delay-500">
                                <span className="text-3xl">🥬</span>
                            </div>

                            {/* Enhanced Decorative Elements */}
                            <div className="absolute bottom-10 left-10 bg-white/95 dark:bg-white/90 rounded-2xl p-4 shadow-2xl backdrop-blur-sm border border-white/50 hover:scale-105 transition-transform">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <ShoppingBag className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">Fresh Basket</div>
                                        <div className="text-xs text-gray-600">Organic Selection</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*/!* Enhanced Bottom Wave *!/*/}
            {/*<div className="absolute bottom-0 left-0 right-0 z-10">*/}
            {/*    <svg className="w-full h-20 md:h-24 lg:h-28" viewBox="0 0 1200 120" preserveAspectRatio="none">*/}
            {/*        <path d="M0,0 L0,60 Q300,120 600,80 T1200,60 L1200,0 Z" className="fill-white dark:fill-gray-900" />*/}
            {/*    </svg>*/}
            {/*</div>*/}
        </section>
    );
};

export default Hero;
