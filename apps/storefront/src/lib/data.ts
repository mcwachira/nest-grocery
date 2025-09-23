// Apply types to your data
import {Category, Product, Testimonial} from "@/src/lib/types.ts";

export const categories: Category[] = [
    { name: 'Fresh Fruit', image: '🥝', count: 134 },
    { name: 'Fresh Vegetables', image: '🥕', count: 150 },
    { name: 'Meat & Fish', image: '🥩', count: 54 },
    { name: 'Snacks', image: '🍪', count: 47 },
    { name: 'Beverages', image: '🥤', count: 43 },
    { name: 'Beauty & Health', image: '💊', count: 38 },
    { name: 'Bread & Bakery', image: '🍞', count: 15 },
    { name: 'Baking Needs', image: '🧁', count: 21 },
    { name: 'Cooking', image: '🍳', count: 25 },
    { name: 'Diabetic Food', image: '🍯', count: 19 },
    { name: 'Dish Detergents', image: '🧽', count: 16 },
    { name: 'Oil', image: '🫒', count: 8 }
];

export const products: Product[] = [
    { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: '🍏', rating: 4, inStock: true, sale: true },
    { id: 2, name: 'Fresh Orange', price: 20.99, image: '🍊', rating: 5, inStock: true },
    { id: 3, name: 'Chinese Cabbage', price: 12.99, image: '🥬', rating: 4, inStock: true },
    { id: 4, name: 'Green Lettuce', price: 9.99, image: '🥬', rating: 4, inStock: true },
    { id: 5, name: 'Eggplant', price: 34.99, image: '🍆', rating: 5, inStock: true },
    { id: 6, name: 'Big Potatoes', price: 20.99, image: '🥔', rating: 3, inStock: true },
    { id: 7, name: 'Corn', price: 20.99, image: '🌽', rating: 5, inStock: true },
    { id: 8, name: 'Fresh Cauliflower', price: 12.99, image: '🥦', rating: 4, inStock: true },
    { id: 9, name: 'Green Capsicum', price: 20.99, image: '🫑', rating: 4, inStock: true },
    { id: 10, name: 'Green Chili', price: 34.99, image: '🌶️', rating: 4, inStock: true }
];

export const testimonials: Testimonial[] = [
    {
        name: "Robert Fox",
        rating: 5,
        text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales.",
        avatar: "👨"
    },
    {
        name: "Dianne Russell",
        rating: 5,
        text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales.",
        avatar: "👩"
    },
    {
        name: "Eleanor Pena",
        rating: 5,
        text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales.",
        avatar: "👩‍🦳"
    }
];