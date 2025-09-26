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

export const allProducts = [
    // Vegetables
    { id: 1, name: 'Red Chili', price: 14.99, image: '🌶️', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 2, name: 'Big Potatoes', price: 14.99, image: '🥔', rating: 5, category: 'Vegetables', inStock: true, sale: false },
    { id: 3, name: 'Chinese Cabbage', price: 14.99, image: '🥬', rating: 4, category: 'Vegetables', inStock: true, sale: false, featured: true },
    { id: 4, name: 'Ladies Finger', price: 14.99, originalPrice: 20.99, image: '🥒', rating: 4, category: 'Vegetables', inStock: true, sale: true },
    { id: 5, name: 'Red Tomato', price: 14.99, image: '🍅', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 6, name: 'Eggplant', price: 14.99, image: '🍆', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 7, name: 'Fresh Cauliflower', price: 14.99, image: '🥦', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 8, name: 'Green Capsicum', price: 14.99, image: '🫑', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 9, name: 'Green Chili', price: 14.99, image: '🌶️', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 10, name: 'Green Cucumber', price: 14.99, originalPrice: 20.99, image: '🥒', rating: 4, category: 'Vegetables', inStock: true, sale: true },
    { id: 11, name: 'Green Lettuce', price: 14.99, image: '🥬', rating: 4, category: 'Vegetables', inStock: true, sale: false },
    { id: 12, name: 'Red Capsicum', price: 14.99, image: '🫑', rating: 4, category: 'Vegetables', inStock: true, sale: false },

    // Fruits
    { id: 13, name: 'Green Apple', price: 14.99, image: '🍏', rating: 4, category: 'Fresh Fruit', inStock: true, sale: true },
    { id: 14, name: 'Fresh Mango', price: 14.99, image: '🥭', rating: 4, category: 'Fresh Fruit', inStock: true, sale: false },
    { id: 15, name: 'Red Apple', price: 16.99, image: '🍎', rating: 5, category: 'Fresh Fruit', inStock: true, sale: false },
    { id: 16, name: 'Orange', price: 12.99, image: '🍊', rating: 4, category: 'Fresh Fruit', inStock: true, sale: false },
    { id: 17, name: 'Banana', price: 8.99, image: '🍌', rating: 4, category: 'Fresh Fruit', inStock: true, sale: false },
    { id: 18, name: 'Grapes', price: 18.99, image: '🍇', rating: 5, category: 'Fresh Fruit', inStock: true, sale: false },

    // Beverages
    { id: 19, name: 'Orange Juice', price: 5.99, image: '🧃', rating: 4, category: 'Beverages', inStock: true, sale: false },
    { id: 20, name: 'Apple Juice', price: 5.99, image: '🧃', rating: 4, category: 'Beverages', inStock: true, sale: false },
    { id: 21, name: 'Water Bottle', price: 2.99, image: '🚰', rating: 5, category: 'Beverages', inStock: true, sale: false },

    // Snacks
    { id: 22, name: 'Potato Chips', price: 3.99, image: '🍟', rating: 4, category: 'Snacks', inStock: true, sale: false },
    { id: 23, name: 'Cookies', price: 4.99, image: '🍪', rating: 4, category: 'Snacks', inStock: true, sale: true },

    // Bread & Bakery
    { id: 24, name: 'White Bread', price: 2.99, image: '🍞', rating: 4, category: 'Bread & Bakery', inStock: true, sale: false },
    { id: 25, name: 'Croissant', price: 1.99, image: '🥐', rating: 4, category: 'Bread & Bakery', inStock: true, sale: false }
];

// Categories with counts
export const categories = [
    { name: 'All Products', count: allProducts.length, active: false },
    { name: 'Fresh Fruit', count: allProducts.filter(p => p.category === 'Fresh Fruit').length, active: false },
    { name: 'Vegetables', count: allProducts.filter(p => p.category === 'Vegetables').length, active: false },
    { name: 'Beverages', count: allProducts.filter(p => p.category === 'Beverages').length, active: false },
    { name: 'Snacks', count: allProducts.filter(p => p.category === 'Snacks').length, active: false },
    { name: 'Bread & Bakery', count: allProducts.filter(p => p.category === 'Bread & Bakery').length, active: false }
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