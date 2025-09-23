
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";

// Import product images
import GreenApple from "../assets/products/green-apple.png";
import Oranges from "../assets/products/oranges.png";
import ChineseCabbage from "../assets/products/chinese-cabbage.png";
import Lettuce from "../assets/products/lettuce.png";
import Eggplant from "../assets/products/eggplant.png";
import Potatoes from "../assets/products/potatoes.png";
import Corn from "../assets/products/corn.png";
import Cauliflower from "../assets/products/cauliflower.png";
import GreenCapsicum from "../assets/products/green-capsicum.png";
import GreenChilli from "../assets/products/green-chilli.png";

// Popular Products Component
const PopularProducts = () => {
    const products = [
        {
            id: 1,
            name: 'Green Apple',
            price: 14.99,
            originalPrice: 20.99,
            image: GreenApple,
            rating: 4,
            inStock: true,
            sale: true
        },
        {id: 2, name: 'Fresh Orange', price: 20.99, image: Oranges, rating: 5, inStock: true},
        {id: 3, name: 'Chinese Cabbage', price: 12.99, image: ChineseCabbage, rating: 4, inStock: true},
        {id: 4, name: 'Green Lettuce', price: 9.99, image: Lettuce, rating: 4, inStock: true},
        {id: 5, name: 'Eggplant', price: 34.99, image: Eggplant, rating: 5, inStock: true},
        {id: 6, name: 'Big Potatoes', price: 20.99, image: Potatoes, rating: 3, inStock: true},
        {id: 7, name: 'Corn', price: 20.99, image: Corn, rating: 5, inStock: true},
        {id: 8, name: 'Fresh Cauliflower', price: 12.99, image: Cauliflower, rating: 4, inStock: true},
        {id: 9, name: 'Green Capsicum', price: 20.99, image: GreenCapsicum, rating: 4, inStock: true},
        {id: 10, name: 'Green Chili', price: 34.99, image: GreenChilli, rating: 4, inStock: true}
    ];

    return (

<section className="py-12 lg:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
<div className="container mx-auto px-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6 ">

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Popular Products</h2>
        <Link href="/products" className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200 flex items-center group">
            View All
            <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4  xl:grid-cols-5 gap-4 md:gap-6">
        {products.slice(0, 10).map((product) => (
            <div key={product.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1 relative">
                {product.sale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-10">
                  Sale 50%
                </span>
                )}
                <div className="relative w-full h-32 md:h-40 mb-4 overflow-hidden rounded-lg">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-green-500 hover:text-white transition-colors duration-200">
                            <Heart className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-green-500 hover:text-white transition-colors duration-200">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="font-medium text-gray-800 dark:text-white mb-2 text-sm line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                    {product.name}
                </h3>

                <div className="flex items-center mb-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.rating}.0)</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">${product.originalPrice}</span>
                        )}
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105">
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        ))}
    </div>
</div>
</section>
    );
};
    export default PopularProducts