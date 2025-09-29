// types.ts

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    productCount: number;
    image: string;
    description: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    category: string;
    categorySlug: string;
    inStock: boolean;
    sale?: boolean;
    featured?: boolean;
}

export interface Testimonial {
    name: string;
    rating: number;
    text: string;
    avatar: string;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}

export type ViewMode = 'grid' | 'list';

// Cart types
export interface CartItem extends Product {
    quantity: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    itemCount: number;
}

// Wishlist types
export interface WishlistItem extends Product {
    addedAt: Date;
}

// Filter types
export interface PriceRange {
    min: number;
    max: number;
}

export interface ProductFilters {
    categories?: string[];
    priceRange?: PriceRange;
    rating?: number;
    inStock?: boolean;
    onSale?: boolean;
}