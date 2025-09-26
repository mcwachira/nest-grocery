'use client';

import Image from 'next/image';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
// import {products} from "@/src/lib/data.ts";

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    discount?: number;
}

interface RelatedProductsProps {
    products: Product[];
}

const RelatedProducts = ({products}:RelatedProductsProps) => {
    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">



                Related Products
            </h2>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        {/* Discount Badge */}

                        {product.discount && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    Save ${product.discount}%

                                </span>
                            </div>
                        )}

                    {/* Product Image */}
<div className="relative aspect-square overflow-hidden">
    <Image src={product.image}

           alt={product.name}
           fill
           className="object-cover group-hover:scale-105 transition-transform duration-300"
    />


{/* Quick Action */}
    {/* Quick Actions */}
    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
        <button className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="bg-green-600 p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200">
            <ShoppingCart className="w-4 h-4 text-white" />
        </button>
    </div>
</div>

                        {/*Product Info*/}

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {product.name}
                            </h3>

                        {/* Rating */}

                            <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600 "}`} key={i}/>
                                ))}
                            </div>


                            {/* Price */}
                            <div className="flex items-center justify-between">
                                <div>
                  <span className="text-green-600 dark:text-green-500 font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                                    {product.originalPrice && (
                                        <span className="text-gray-500 line-through text-sm ml-2">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                                    )}
                                </div>

                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts