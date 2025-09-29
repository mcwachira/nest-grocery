// Apply types to your data
// import {Category, Product, Testimonial} from "@/src/lib/types.ts";
//
//
//
// export const categories: Category[] = [
//     { name: 'Fresh Fruit', image: '../assets/categories/fresh-fruit.png', count: 134 },
//     { name: 'Fresh Vegetables', image: '../assets/categories/fresh-vegetables.png', count: 150 },
//     { name: 'Meat & Fish', image: '../assets/categories/meat.png', count: 54 },
//     { name: 'Beverages', image: '../assets/categories/beverage.png', count: 43 },
//     { name: 'Bread & Bakery', image: '../assets/categories/bread-bakery.png', count: 15 },
//     { name: 'Baking Needs', image: '../assets/categories/baking.png', count: 21 },
//     { name: 'Cooking', image: '../assets/categories/cooking.png', count: 25 },
//     { name: 'Diabetic Food', image: '../assets/categories/diabetic-foods.png', count: 19 },
//
// ];
//
// export const products: Product[] = [
//     { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: '../assets/products/green-apple.png', rating: 4, inStock: true, sale: true },
//     { id: 2, name: 'Fresh Orange', price: 20.99, image: '../assets/products/oranges.png', rating: 5, inStock: true },
//     { id: 3, name: 'Chinese Cabbage', price: 12.99,image: '../assets/products/chinese-cabbage.png', rating: 4, inStock: true },
//     { id: 4, name: 'Green Lettuce', price: 9.99,image: '../assets/products/lettuce.png', rating: 4, inStock: true },
//     { id: 5, name: 'Eggplant', price: 34.99, image: '../assets/products/eggplant.png', rating: 5, inStock: true },
//     { id: 6, name: 'Big Potatoes', price: 20.99, image: '../assets/products/potatoes.png', rating: 3, inStock: true },
//     { id: 7, name: 'Corn', price: 20.99, image: '../assets/products/corn.png', rating: 5, inStock: true },
//     { id: 8, name: 'Fresh Cauliflower', price: 12.99, image: '../assets/products/cauliflower.png', rating: 4, inStock: true },
//     { id: 9, name: 'Green Capsicum', price: 20.99, image: '../assets/products/green-capsicum.png', rating: 4, inStock: true },
//     { id: 10, name: 'Green Chili', price: 34.99, image: '../assets/products/green-chilli.png', rating: 4, inStock: true }
// ];

export const categories: Category[] = [
    {
        id: 1,
        name: 'Fresh Fruit',
        slug: 'fresh-fruit',
        icon: '🍎',
        productCount: 6,
        image: '🍎',
        description: 'Fresh and organic fruits delivered daily'
    },
    {
        id: 2,
        name: 'Vegetables',
        slug: 'vegetables',
        icon: '🥕',
        productCount: 6,
        image: '🥬',
        description: 'Farm fresh vegetables, organic and healthy'
    },
    {
        id: 3,
        name: 'Meat & Fish',
        slug: 'meat-fish',
        icon: '🥩',
        productCount: 2,
        image: '🥩',
        description: 'Premium quality meat and fresh seafood'
    },
    {
        id: 4,
        name: 'Beverages',
        slug: 'beverages',
        icon: '🥤',
        productCount: 3,
        image: '🧃',
        description: 'Refreshing drinks and healthy beverages'
    },
    {
        id: 5,
        name: 'Bread & Bakery',
        slug: 'bread-bakery',
        icon: '🍞',
        productCount: 2,
        image: '🥐',
        description: 'Freshly baked bread and pastries daily'
    },
    {
        id: 6,
        name: 'Snacks',
        slug: 'snacks',
        icon: '🍪',
        productCount: 3,
        image: '🍿',
        description: 'Healthy and tasty snack options'
    },
    {
        id: 7,
        name: 'Dairy Products',
        slug: 'dairy-products',
        icon: '🥛',
        productCount: 2,
        image: '🧀',
        description: 'Fresh milk, cheese, and dairy products'
    },
    {
        id: 8,
        name: 'Beauty & Health',
        slug: 'beauty-health',
        icon: '💊',
        productCount: 2,
        image: '💄',
        description: 'Organic beauty and health products'
    }
];

export const allProducts: Product[] = [
    // Fresh Fruit
    { id: 1, name: 'Green Apple', price: 14.99, originalPrice: 20.99, image: '🍏', rating: 4, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true, sale: true },
    { id: 2, name: 'Red Apple', price: 16.99, image: '🍎', rating: 5, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },
    { id: 3, name: 'Orange', price: 12.99, image: '🍊', rating: 4, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },
    { id: 4, name: 'Banana', price: 8.99, image: '🍌', rating: 4, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },
    { id: 5, name: 'Mango', price: 18.99, image: '🥭', rating: 5, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },
    { id: 6, name: 'Grapes', price: 22.99, image: '🍇', rating: 5, category: 'Fresh Fruit', categorySlug: 'fresh-fruit', inStock: true },

    // Vegetables
    { id: 7, name: 'Chinese Cabbage', price: 14.99, image: '🥬', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
    { id: 8, name: 'Red Tomato', price: 14.99, image: '🍅', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
    { id: 9, name: 'Green Capsicum', price: 14.99, image: '🫑', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
    { id: 10, name: 'Eggplant', price: 14.99, image: '🍆', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
    { id: 11, name: 'Cauliflower', price: 14.99, image: '🥦', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true },
    { id: 12, name: 'Green Chili', price: 14.99, originalPrice: 20.99, image: '🌶️', rating: 4, category: 'Vegetables', categorySlug: 'vegetables', inStock: true, sale: true },

    // Beverages
    { id: 13, name: 'Orange Juice', price: 5.99, image: '🧃', rating: 4, category: 'Beverages', categorySlug: 'beverages', inStock: true },
    { id: 14, name: 'Apple Juice', price: 5.99, image: '🧃', rating: 4, category: 'Beverages', categorySlug: 'beverages', inStock: true },
    { id: 15, name: 'Water Bottle', price: 2.99, image: '💧', rating: 5, category: 'Beverages', categorySlug: 'beverages', inStock: true },

    // Snacks
    { id: 16, name: 'Potato Chips', price: 3.99, image: '🍟', rating: 4, category: 'Snacks', categorySlug: 'snacks', inStock: true },
    { id: 17, name: 'Cookies', price: 4.99, originalPrice: 7.99, image: '🍪', rating: 4, category: 'Snacks', categorySlug: 'snacks', inStock: true, sale: true },
    { id: 18, name: 'Popcorn', price: 3.49, image: '🍿', rating: 4, category: 'Snacks', categorySlug: 'snacks', inStock: true },

    // Bread & Bakery
    { id: 19, name: 'White Bread', price: 2.99, image: '🍞', rating: 4, category: 'Bread & Bakery', categorySlug: 'bread-bakery', inStock: true },
    { id: 20, name: 'Croissant', price: 1.99, image: '🥐', rating: 4, category: 'Bread & Bakery', categorySlug: 'bread-bakery', inStock: true },

    // Dairy Products
    { id: 21, name: 'Fresh Milk', price: 4.99, image: '🥛', rating: 5, category: 'Dairy Products', categorySlug: 'dairy-products', inStock: true },
    { id: 22, name: 'Cheese', price: 8.99, image: '🧀', rating: 5, category: 'Dairy Products', categorySlug: 'dairy-products', inStock: true },

    // Meat & Fish
    { id: 23, name: 'Chicken Breast', price: 12.99, image: '🍗', rating: 4, category: 'Meat & Fish', categorySlug: 'meat-fish', inStock: true },
    { id: 24, name: 'Fresh Fish', price: 18.99, image: '🐟', rating: 5, category: 'Meat & Fish', categorySlug: 'meat-fish', inStock: true },

    // Beauty & Health
    { id: 25, name: 'Organic Lotion', price: 15.99, image: '🧴', rating: 4, category: 'Beauty & Health', categorySlug: 'beauty-health', inStock: true },
    { id: 26, name: 'Vitamins', price: 24.99, image: '💊', rating: 5, category: 'Beauty & Health', categorySlug: 'beauty-health', inStock: true }
];


export const tags = ['Healthy', 'Low fat', 'Vegetarian', 'Kid foods', 'Vitamins', 'Bread', 'Meat', 'Snacks', 'Tiffin', 'Launch', 'Dinner', 'BreadFast', 'Fruit'];

// Sale products for sidebar
export const saleProducts = allProducts.filter(p => p.sale).slice(0, 3);

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