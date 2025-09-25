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
    Quote,
    X,
    Plus,
    Minus,
    Share2,
    Facebook,
    Twitter,
    Instagram
} from "lucide-react";

// Enhanced PopularProducts with Quick View Modal
const PopularProducts = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const products = [
        {
            id: 1,
            name: 'Premium Green Apple',
            price: 14.99,
            originalPrice: 20.99,
            emoji: '🍎',
            rating: 4,
            inStock: true,
            sale: true,
            sku: '251594',
            brand: 'Farmacy',
            category: 'Fruits',
            tags: ['Fresh', 'Organic', 'Apple', 'Premium'],
            description: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec, ultrices et ipsum. Nulla varius magna a consequat pulvinar.',
            images: ['🍎', '🍏', '🍎', '🍏']
        },
        {
            id: 2,
            name: 'Fresh Valencia Orange',
            price: 20.99,
            emoji: '🍊',
            rating: 5,
            inStock: true,
            sku: '251595',
            brand: 'Farmacy',
            category: 'Fruits',
            tags: ['Fresh', 'Valencia', 'Orange', 'Citrus'],
            description: 'Juicy and sweet Valencia oranges, perfect for fresh juice or snacking. Rich in vitamin C and natural antioxidants.',
            images: ['🍊', '🧡', '🍊', '🧡']
        },
        {
            id: 3,
            name: 'Organic Chinese Cabbage',
            price: 12.99,
            emoji: '🥬',
            rating: 4,
            inStock: true,
            sku: '251596',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Vegetables', 'Healthy', 'Chinese', 'Cabbage', 'Green Cabbage'],
            description: 'Fresh organic Chinese cabbage, perfect for stir-fries, soups, and salads. Crisp texture and mild flavor.',
            images: ['🥬', '🥒', '🥬', '🥒']
        },
        {
            id: 4,
            name: 'Crisp Green Lettuce',
            price: 9.99,
            emoji: '🥬',
            rating: 4,
            inStock: true,
            sku: '251597',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Lettuce', 'Green', 'Fresh', 'Salad'],
            description: 'Crispy and fresh green lettuce, ideal for salads and sandwiches. Grown with care for optimal freshness.',
            images: ['🥬', '🥒', '🥬', '🥒']
        },
        {
            id: 5,
            name: 'Fresh Eggplant',
            price: 34.99,
            emoji: '🍆',
            rating: 5,
            inStock: true,
            sku: '251598',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Eggplant', 'Fresh', 'Purple', 'Vegetable'],
            description: 'Premium fresh eggplant with glossy purple skin. Perfect for grilling, roasting, or Mediterranean dishes.',
            images: ['🍆', '💜', '🍆', '💜']
        },
        {
            id: 6,
            name: 'Organic Potatoes',
            price: 20.99,
            emoji: '🥔',
            rating: 3,
            inStock: true,
            sku: '251599',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Potatoes', 'Organic', 'Root Vegetable'],
            description: 'High-quality organic potatoes, perfect for mashing, roasting, or frying. Grown without pesticides.',
            images: ['🥔', '🤎', '🥔', '🤎']
        },
        {
            id: 7,
            name: 'Sweet Corn',
            price: 20.99,
            emoji: '🌽',
            rating: 5,
            inStock: true,
            sku: '251600',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Corn', 'Sweet', 'Fresh', 'Yellow'],
            description: 'Sweet and tender corn on the cob, harvested at peak ripeness for maximum flavor and sweetness.',
            images: ['🌽', '💛', '🌽', '💛']
        },
        {
            id: 8,
            name: 'Fresh Cauliflower',
            price: 12.99,
            emoji: '🥦',
            rating: 4,
            inStock: true,
            sku: '251601',
            brand: 'Farmacy',
            category: 'Vegetables',
            tags: ['Cauliflower', 'White', 'Fresh', 'Healthy'],
            description: 'Fresh white cauliflower with compact florets. Great for roasting, steaming, or making cauliflower rice.',
            images: ['🥦', '🤍', '🥦', '🤍']
        }
    ];

    const openQuickView = (product) => {
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

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeQuickView();
        };

        if (selectedProduct) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [selectedProduct]);

    return (
        <>
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
                                        <button
                                            onClick={() => openQuickView(product)}
                                            className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition-colors duration-200"
                                        >
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

            {/* Quick View Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={closeQuickView}
                    ></div>

                    {/* Modal Content */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transform transition-all">
                            {/* Close Button */}
                            <button
                                onClick={closeQuickView}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                                {/* Product Images */}
                                <div className="space-y-4">
                                    {/* Main Image */}
                                    <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                        <div className="text-8xl">
                                            {selectedProduct.images[selectedImage]}
                                        </div>
                                    </div>

                                    {/* Thumbnail Images */}
                                    <div className="flex gap-3">
                                        {selectedProduct.images.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`w-20 h-20 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
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
                                <div className="space-y-6">
                                    {/* Product Title & Status */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                                                {selectedProduct.name}
                                            </h1>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                                In Stock
                                            </span>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-5 h-5 ${i < selectedProduct.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                ))}
                                            </div>
                                            <span className="text-gray-600 dark:text-gray-400">4 Review</span>
                                            <span className="text-gray-400">SKU: {selectedProduct.sku}</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            ${selectedProduct.price}
                                        </span>
                                        {selectedProduct.originalPrice && (
                                            <>
                                                <span className="text-xl text-gray-400 line-through">
                                                    ${selectedProduct.originalPrice}
                                                </span>
                                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                                                    64% Off
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Brand */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                                        <span className="font-medium text-gray-800 dark:text-white">{selectedProduct.brand}</span>
                                    </div>

                                    {/* Share */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600 dark:text-gray-400">Share Item:</span>
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                                                <Facebook className="w-5 h-5" />
                                            </button>
                                            <button className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                                                <Twitter className="w-5 h-5" />
                                            </button>
                                            <button className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                                                <Instagram className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {selectedProduct.description}
                                    </p>

                                    {/* Quantity & Add to Cart */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                            <button
                                                onClick={decrementQuantity}
                                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                            >
                                                <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <span className="px-4 py-3 font-medium text-gray-800 dark:text-white border-x border-gray-300 dark:border-gray-600">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQuantity}
                                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                                            >
                                                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>

                                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                                            <ShoppingCart className="w-5 h-5" />
                                            Add to Cart
                                        </button>

                                        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-colors duration-200">
                                            <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>

                                    {/* Category & Tags */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <Link href={`/category/${selectedProduct.category.toLowerCase()}`} className="text-green-600 dark:text-green-400 hover:underline">
                                                {selectedProduct.category}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-gray-600 dark:text-gray-400">Tag:</span>
                                            {selectedProduct.tags.map((tag, index) => (
                                                <span key={index}>
                                                    <Link href={`/tag/${tag.toLowerCase()}`} className="text-green-600 dark:text-green-400 hover:underline">
                                                        {tag}
                                                    </Link>
                                                    {index < selectedProduct.tags.length - 1 && (
                                                        <span className="text-gray-400 ml-1">,</span>
                                                    )}
                                                </span>
                                            ))}
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