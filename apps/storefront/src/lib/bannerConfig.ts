// src/lib/bannerConfig.ts
export const bannerConfig: Record<string, any> = {
    "All Products": {
        featured: {
            title: "Mega Store Sale",
            description: "Shop all categories with discounts up to 50%",
            href: "/sale",
            emoji: "🛍️",
            discount: "50%",
            discountLabel: "OFF",
            validity: "Valid this week only",
            gradient: "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700",
            ctaText: "Shop All Deals",
        },
        sideBanners: [
            {
                title: "Fresh Fruits",
                description: "Daily picked & delivered",
                href: "/fruits",
                emoji: "🍎",
                gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
            },
            {
                title: "Bakery Specials",
                description: "Baked fresh every morning",
                href: "/bakery",
                emoji: "🥖",
                gradient: "bg-gradient-to-br from-yellow-500 to-orange-500",
            },
        ],
    },

    Fruits: {
        featured: {
            title: "Fresh & Organic",
            description: "Get 30% off all fruits this week!",
            href: "/fruits",
            emoji: "🍇",
            discount: "30%",
            discountLabel: "OFF",
            validity: "Until Sunday",
            gradient: "bg-gradient-to-r from-green-500 via-lime-600 to-emerald-700",
            ctaText: "Shop Fruits",
        },
        sideBanners: [
            {
                title: "Tropical Picks",
                description: "Mangoes, pineapples & more",
                href: "/fruits/tropical",
                emoji: "🥭",
                gradient: "bg-gradient-to-br from-yellow-400 to-orange-600",
            },
            {
                title: "Citrus Boost",
                description: "Lemons, oranges, grapefruits",
                href: "/fruits/citrus",
                emoji: "🍊",
                gradient: "bg-gradient-to-br from-orange-500 to-red-500",
            },
        ],
    },

    Bakery: {
        featured: {
            title: "Warm & Fresh",
            description: "20% off all bakery items today!",
            href: "/bakery",
            emoji: "🥐",
            discount: "20%",
            discountLabel: "OFF",
            validity: "Today only",
            gradient: "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600",
            ctaText: "Shop Bakery",
        },
        sideBanners: [
            {
                title: "Artisan Breads",
                description: "Crafted with love",
                href: "/bakery/bread",
                emoji: "🍞",
                gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
            },
            {
                title: "Sweet Treats",
                description: "Cakes & pastries",
                href: "/bakery/cakes",
                emoji: "🎂",
                gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
            },
        ],
    },
};
