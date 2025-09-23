'use client';

import { ArrowRight, Leaf, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import HeroImage from "@/src/assets/hero-woman.png";

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 dark:from-green-600 dark:via-green-700 dark:to-green-800">
            {/* Background Pattern (moved to CSS utility) */}
            <div className="absolute inset-0 opacity-10 z-10 bg-hero-pattern"></div>

            <div className="container mx-auto px-4 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[600px]">
                    {/* Left Content */}
                    <div
                        className={`space-y-6 lg:space-y-8 text-center lg:text-left transition-all duration-1000 ${
                            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                        }`}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                            <Leaf className="w-4 h-4" />
                            <span className="text-sm font-medium">100% Organic</span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                                Fresh & Healthy
                                <br />
                                <span className="text-yellow-300 dark:text-yellow-400">
                  Organic Food
                </span>
                            </h1>

                            {/* Sale Banner */}
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                  Sale up to 30% OFF
                </span>
                                <div className="hidden sm:flex items-center space-x-1 text-white/90">
                                    <Star className="w-4 h-4 fill-current text-yellow-300" />
                                    <span className="text-sm">Premium Quality</span>
                                </div>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <p className="text-lg lg:text-xl text-white/90 dark:text-white/80 max-w-md mx-auto lg:mx-0 leading-relaxed">
                            Free shipping on all your orders. Get fresh, organic produce
                            delivered right to your doorstep.
                        </p>

                        {/* Features List */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-white/90">
                            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                                <Truck className="w-4 h-4" />
                                <span className="text-sm">Free Delivery</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                                <Leaf className="w-4 h-4" />
                                <span className="text-sm">100% Natural</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                                <ShoppingBag className="w-4 h-4" />
                                <span className="text-sm">Fresh Daily</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <Link
                                href="/shop"
                                className=" cursor-pointer group bg-white dark:bg-gray-100 text-green-600 dark:text-green-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <span>Shop now</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="/categories"
                                className=" crusor-pointer border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm"
                            >
                                <span>Browse Categories</span>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    1000+
                                </div>
                                <div className="text-sm text-white/80">Happy Customers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    500+
                                </div>
                                <div className="text-sm text-white/80">Fresh Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl font-bold text-white">
                                    24/7
                                </div>
                                <div className="text-sm text-white/80">Support</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div
                        className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
                            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        }`}
                    >
                        <div className="relative w-full max-w-lg lg:max-w-xl">
                            {/* Main Image Container */}
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm p-8">
                                <div className="w-full h-full rounded-2xl relative overflow-hidden">
                                    <Image
                                        src={HeroImage}
                                        alt="Fresh organic food with woman holding vegetables"
                                        fill
                                        className="object-cover rounded-2xl"
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                <span className="text-2xl">🍇</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-400 dark:bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-3xl">🥕</span>
                            </div>
                            <div className="absolute top-1/4 -right-8 w-12 h-12 bg-red-400 dark:bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
                                <span className="text-xl">🍅</span>
                            </div>
                            <div className="absolute bottom-1/4 -left-8 w-14 h-14 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-500">
                                <span className="text-2xl">🥬</span>
                            </div>

                            {/* Decorative basket */}
                            <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-white/80 rounded-xl p-3 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center space-x-2">
                                    <ShoppingBag className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">
                    Fresh Basket
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/*/!* Bottom Wave *!/*/}
            {/*<div className="absolute bottom-0 left-0 right-0">*/}
            {/*    <svg*/}
            {/*        className="w-full h-auto"*/}
            {/*        viewBox="0 0 1200 120"*/}
            {/*        preserveAspectRatio="none"*/}
            {/*    >*/}
            {/*        <path*/}
            {/*            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"*/}
            {/*            className="fill-white dark:fill-gray-100"*/}
            {/*        ></path>*/}
            {/*    </svg>*/}
            {/*</div>*/}
        </section>
    );
};

export default Hero;
