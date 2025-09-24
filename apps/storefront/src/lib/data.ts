// Apply types to your data
import {Category, Product, Testimonial} from "@/src/lib/types.ts";



export const categories: Category[] = [
    { name: 'Fresh Fruit', image: '../assets/categories/fresh-fruit.png', count: 134 },
    { name: 'Fresh Vegetables', image: '../assets/categories/fresh-vegetables.png', count: 150 },
    { name: 'Meat & Fish', image: '../assets/categories/meat.png', count: 54 },
    { name: 'Beverages', image: '../assets/categories/beverage.png', count: 43 },
    { name: 'Bread & Bakery', image: '../assets/categories/bread-bakery.png', count: 15 },
    { name: 'Baking Needs', image: '../assets/categories/baking.png', count: 21 },
    { name: 'Cooking', image: '../assets/categories/cooking.png', count: 25 },
    { name: 'Diabetic Food', image: '../assets/categories/diabetic-foods.png', count: 19 },

];

export const products: Product[] = [
    { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: '../assets/products/green-apple.png', rating: 4, inStock: true, sale: true },
    { id: 2, name: 'Fresh Orange', price: 20.99, image: '../assets/products/oranges.png', rating: 5, inStock: true },
    { id: 3, name: 'Chinese Cabbage', price: 12.99,image: '../assets/products/chinese-cabbage.png', rating: 4, inStock: true },
    { id: 4, name: 'Green Lettuce', price: 9.99,image: '../assets/products/lettuce.png', rating: 4, inStock: true },
    { id: 5, name: 'Eggplant', price: 34.99, image: '../assets/products/eggplant.png', rating: 5, inStock: true },
    { id: 6, name: 'Big Potatoes', price: 20.99, image: '../assets/products/potatoes.png', rating: 3, inStock: true },
    { id: 7, name: 'Corn', price: 20.99, image: '../assets/products/corn.png', rating: 5, inStock: true },
    { id: 8, name: 'Fresh Cauliflower', price: 12.99, image: '../assets/products/cauliflower.png', rating: 4, inStock: true },
    { id: 9, name: 'Green Capsicum', price: 20.99, image: '../assets/products/green-capsicum.png', rating: 4, inStock: true },
    { id: 10, name: 'Green Chili', price: 34.99, image: '../assets/products/green-chilli.png', rating: 4, inStock: true }
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