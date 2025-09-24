"use client"
import {useEffect, useState} from "react";

// Import product images
import GreenApple from "../assets/products/green-apple.png";
import Oranges from "../assets/products/oranges.png";
import ChineseCabbage from "../assets/products/chinese-cabbage.png";
import Lettuce from "../assets/products/lettuce.png";
import Eggplant from "../assets/products/eggplant.png";
import Potatoes from "../assets/products/potatoes.png";
import Corn from "../assets/products/corn.png";
import Cauliflower from "../assets/products/cauliflower.png";

import Link from "next/link";
import Image from "next/image";
import {Star, ShoppingCart} from "lucide-react";

const HotDeals = () => {

    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 18, minutes: 54, seconds: 21 });

    const products = [
        { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: GreenApple, rating: 4, inStock: true, sale: true },
        { id: 2, name: 'Fresh Orange', price: 20.99, image: Oranges, rating: 5, inStock: true },
        { id: 3, name: 'Chinese Cabbage', price: 12.99, image: ChineseCabbage, rating: 4, inStock: true },
        { id: 4, name: 'Green Lettuce', price: 9.99, image: Lettuce, rating: 4, inStock: true },
        { id: 5, name: 'Eggplant', price: 34.99, image: Eggplant, rating: 5, inStock: true },
        { id: 6, name: 'Big Potatoes', price: 20.99, image: Potatoes, rating: 3, inStock: true },
        { id: 7, name: 'Corn', price: 20.99, image: Corn, rating: 5, inStock: true },
        { id: 8, name: 'Fresh Cauliflower', price: 12.99, image: Cauliflower, rating: 4, inStock: true }
    ];

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


    return(
 <section className="py-12 lg:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
     <div className="container mx-auto px-4">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Hot Deals</h2>
             <Link href="/deals" className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200 flex items-center group">
                 View All
                 <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
             </Link>
         </div>
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
{/*    Featured  Deal */}

    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6">
        <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                    src={GreenApple}
                    alt="Green Apple"
                    fill
                    className="object-contain"
                />
            </div>
<h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
    Green apple
</h3>
            <div className="flex itens-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">$12.99</span>
                <span className="text-gray-500 dark:text-gray-400 line-through ml-2">$16.99</span>
            </div>
            <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-full rounded-full" style={{width: '78%'}}></div>

            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hurry up! Offer ends in:</p>

            <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="bg-gray-800 dark:bg-gray-700 text-white px-2 py-2 rounded text-center">
                    <div className="font-bold">{timeLeft.days}</div>
                    <div className="text-xs opacity-75">DAYS</div>
                </div>

                <div className="bg-gray-800 dark:bg-gray-700 text-white px-2 py-2 rounded text-center">
                    <div className="font-bold">{timeLeft.hours}</div>
                    <div className="text-xs opacity-75">HOURS</div>
                </div>

                <div className="bg-gray-800 dark:bg-gray-700 text-white px-2 py-2 rounded text-center">
                    <div className="font-bold">{timeLeft.minutes}</div>
                    <div className="text-xs opacity-75">MINS</div>
                </div>
                <div className="bg-gray-800 dark:bg-gray-700 text-white px-2 py-2 rounded text-center">
                    <div className="font-bold">{timeLeft.seconds}</div>
                    <div className="text-xs opacity-75">SECS</div>
                </div>
            </div>
        </div>
</div>

    {/* Product Grid */}
    <div className="lg:col-span-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="relative w-full h-24 mb-3 overflow-hidden rounded">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                    </div>
                    <h3 className="font-medium text-gray-800 dark:text-white mb-2 text-sm line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-green-600 dark:text-green-500">${product.price}</span>
                        <button className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <ShoppingCart className="w-4 h-4" />
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


export  default  HotDeals