'use client';

import {useCallback, useState} from 'react';
import { Star, Heart, Share2, Facebook, Twitter, Instagram, Minus, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import Link from "next/link";

interface ProductInfoProps {
    product: {
        name: string;
        price: number;
        originalPrice?: number;
        rating: number;
        reviewCount: number;
        sku: string;
        brand: string;
        inStock: boolean;
        description: string;
        category: string;
        tags: string[];
    };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Product Name & Stock Status */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.name}
                </h1>
                <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.inStock
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
                </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-5 h-5 ${
                                i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
          {product.rating} ({product.reviewCount} Reviews)
        </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
          SKU: {product.sku}
        </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
        <span className="text-3xl font-bold text-green-600 dark:text-green-500">
          ${product.price.toFixed(2)}
        </span>
                {product.originalPrice && (
                    <>
            <span className="text-xl text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              {discountPercentage}% Off
            </span>
                    </>
                )}
            </div>

            {/* Brand */}
            <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.brand}</span>
            </div>

            {/* Description */}
            <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description}
                </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                        onClick={decrementQuantity}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
                    <button
                        onClick={incrementQuantity}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 flex-1"
                    disabled={!product.inStock}
                >
                    Add to Cart
                </Button>

                <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-lg border transition-colors duration-200 ${
                        isWishlisted
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-400">Share item:</span>
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                        <Facebook className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors duration-200">
                        <Twitter className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition-colors duration-200">
                        <Instagram className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors duration-200">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Category and Tags */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Category:</span>
                    <a href="#" className="text-sm text-primary hover:underline">{product.category}</a>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-sm font-medium">Tag:</span>
                    <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                            <Link
                                key={index}
                                href="#"
                                className="text-sm text-primary hover:underline"
                            >
                                {tag}{index < product.tags.length - 1 && ','}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProductInfo