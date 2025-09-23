// types.ts

// Category type
export type Category = {
    name: string;
    image: string; // emoji or image string
    count: number;
};

// Product type
export type Product = {
    id: number;
    name: string;
    price: number;
    originalPrice?: number; // optional
    image: string;
    rating: number; // e.g., 1–5 stars
    inStock: boolean;
    sale?: boolean; // optional
};

// Testimonial type
export type Testimonial = {
    name: string;
    rating: number; // e.g., 1–5 stars
    text: string;
    avatar: string; // emoji or image string
};
