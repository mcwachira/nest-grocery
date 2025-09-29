"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/src/lib/types';

interface WishlistContext {
    wishlistItems:Product[];
    addToWishlist:(product:Product)=>void;
    removeFromWishlist:(product:Product)=>void;
    isInWishlist:(product:Product)=>boolean;
    clearWishlist:() => void;
    getWishlistCount:() => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const WishlistProvider = ({children}:{children:ReactNode}) => {


    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

    const addToWishlist = (product:Product) => {
        setWishlistItems((prev) => {
            const exist = prev.find(item => item.id === product.id)

            if(exist){
                return prev
            }

            return [...prev, product];
        })
    }


    const removeFromWishlist =(productId:number) => {
        setWishlistItems((prev) => prev.filter(item => item.id  === productId))
    }
    const isInWishlist = (productId:number) => {
        return wishlistItems.some((item) => item.id === productId);
    }

    const clearWishlist = () => {
        setWishlistItems([]);
    }


    const getWishlistCount = () => {
        return wishlistItems.length;
    };
    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                getWishlistCount,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};