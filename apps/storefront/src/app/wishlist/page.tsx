"use client"
import {useState} from "react";
import {useRouter}   from "next/navigation";
import { X, Facebook, Twitter, Instagram } from 'lucide-react';
import {useCart} from "@/src/contexts/CartContext.tsx";

import BreadCrumbs from '@/src/components/common/BreadCrumbs';
import  Newsletter  from '@/src/components/common/NewsLetter.tsx';
import { Product } from '@/src/lib/types';

// Mock wishlist data
const mockWishlistItems: Product[] = [
    { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: '🍏', rating: 4, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true, sale: true },
    { id: 2, name: 'Chinese Cabbage', price: 14.99, image: '🥬', rating: 4, category: 'Vegetables', inStock: true },
    { id: 3, name: 'Orange Juice', price: 5.99, image: '🧃', rating: 4, category: 'Beverages',  inStock: true },
    { id: 4, name: 'Potato Chips', price: 3.99, image: '🍟', rating: 4, category: 'Snacks', inStock: true },
    { id: 5, name: 'White Bread', price: 2.99, image: '🍞', rating: 4, category: 'Bread & Bakery', inStock: true },
    { id: 6, name: 'Fresh Milk', price: 4.99, image: '🥛', rating: 5, category: 'Dairy Products', inStock: true },

];

const WishlistPage = () => {

    const router = useRouter();
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState<Product[]>(mockWishlistItems);

    const handleRemoveFromWishlist = (productId: string) => {
        setWishlistItems(items => items.filter(item => item.id !== productId));
    };

    const handleAddToCart = (product: Product) => {
        if (product.inStock) {
            addToCart(product);
        }
    };

    const handleShare = (platform: string) => {
        console.log(`Sharing wishlist on ${platform}`);
    };


    return (
        <div className="min-h-screen bg-background">
            <BreadCrumbs items={[{ label: 'Wishlist' }]} />

            <div className="contianer mx-auto px-4 py-8">

                <h1 className="text-3xl font-bold text-foreground mb-8">My Wishlist</h1>

                {wishlistItems.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-lg">
                        <div className="text-6xl mb-4">💚</div>
                        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-6">
                            Start adding products you love to your wishlist!
                        </p>
                        <button
                            onClick={() => router.push('/products')}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-sm text-foreground uppercase">Product</th>
                                <th className="text-center py-4 px-6 font-semibold text-sm text-foreground uppercase">Price</th>
                                <th className="text-center py-4 px-6 font-semibold text-sm text-foreground uppercase">Stock Status</th>
                                <th className="text-center py-4 px-6 font-semibold text-sm text-foreground uppercase w-48"></th>
                                <th className="w-12"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {wishlistItems.map((item) => (
                                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-6 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="text-5xl flex-shrink-0">{item.image}</div>
                                            <div>
                                                <h3
                                                    className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
                                                    onClick={() => router.push(`/products/${item.id}`)}
                                                >
                                                    {item.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center py-6 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                                <span className="text-lg font-bold text-foreground">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            {item.originalPrice && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                        ${item.originalPrice.toFixed(2)}
                                                    </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center py-6 px-6">
                                        {item.inStock ? (
                                            <span className="inline-block bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                    In Stock
                                                </span>
                                        ) : (
                                            <span className="inline-block bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                                                    Out of Stock
                                                </span>
                                        )}
                                    </td>
                                    <td className="text-center py-6 px-6">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.inStock}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                                item.inStock
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                            }`}
                                        >
                                            Add to Cart
                                        </button>
                                    </td>
                                    <td className="text-center py-6 px-6">
                                        <button
                                            onClick={() => handleRemoveFromWishlist(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors text-xl"
                                            aria-label="Remove from wishlist"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-foreground">Share:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                                        aria-label="Share on Facebook"
                                    >
                                        <Facebook className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="w-9 h-9 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"
                                        aria-label="Share on Twitter"
                                    >
                                        <Twitter className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('pinterest')}
                                        className="w-9 h-9 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"
                                        aria-label="Share on Pinterest"
                                    >
                                        <Facebook className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('instagram')}
                                        className="w-9 h-9 rounded-full border border-border text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors"
                                        aria-label="Share on Instagram"
                                    >
                                        <Instagram className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Newsletter />
        </div>
    );
};

export default WishlistPage;