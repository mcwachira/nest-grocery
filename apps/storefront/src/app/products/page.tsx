"use client"
import React, { useState, useMemo } from 'react';
import {  Grid3X3, List, Filter} from 'lucide-react';
import PromotionalBanner from "@/src/components/common/PromotionalBanner.tsx";
import {bannerConfig} from "@/src/lib/bannerConfig.ts";
import Sidebar from "@/src/components/common/Sidebar.tsx";
import Pagination from "@/src/components/products/Pagination.tsx";
import {allProducts, categories} from "@/src/lib/data.ts";
import ProductsGrid from "@/src/components/products/ProductGrid";
import Newsletter from "@/src/components/common/NewsLetter.tsx";
import {Category, Product} from "@/src/lib/types.ts";
import BreadCrumbs from "@/src/components/common/BreadCrumbs";
import {useRouter} from "next/navigation";
import {useCart} from "@/src/contexts/CartContext.tsx";
import CartPopup from "@/src/components/cart/CartPopup.tsx";

// Mock product data with categories



const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('latest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showCartPopup, setShowCartPopup] = useState(false);


    const itemsPerPage = 16;

    const router = useRouter()
    const { addToCart } = useCart();

    const sortOptions = [
        {value: 'latest', label: 'Latest'},
        {value: 'price-low', label: 'Price: Low to High'},
        {value: 'price-high', label: 'Price: High to Low'},
        {value: 'rating', label: 'Rating'},
        {value: 'popularity', label: 'Popularity'}
    ];

    // Filtered products based on selected categories
    const filteredProducts = useMemo(() => {
        let products = selectedCategory === 'All Products'
            ? allProducts
            : allProducts.filter(product => product.category === selectedCategory);

        // Sort products
        switch(sortBy) {
            case 'price-low':
                products = products.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                products = products.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                products = products.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return products;
    }, [selectedCategory, sortBy]);



    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    console.log('filtered products', filteredProducts)
    console.log("paginated products", paginatedProducts)

    const handleCategoryChange = (category:Category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Reset to first page when category changes
    };

    const handleProductClick = (product:Product) => {
    router.push(`/products/${product.id}`);
    };

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setShowCartPopup(true);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-background">
            <BreadCrumbs items={[{ label: 'products' }]} />

            <div className="container mx-auto px-4 py-8">
                <PromotionalBanner
                    heading="Special Offers"
                    subheading={`Exclusive deals for ${selectedCategory}`}
                    featured={bannerConfig[selectedCategory]?.featured ?? bannerConfig["All Products"].featured}
                    sideBanners={bannerConfig[selectedCategory]?.sideBanners ?? bannerConfig["All Products"].sideBanners}
                />

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value as Category)}
                            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        >
                            {categories.map((category) => (
                                <option key={category.name} value={category.name}>
                                    {category.name} ({category.count})
                                </option>
                            ))}
                        </select>

                        <select className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                            <option>Select Price</option>
                            <option>$0 - $10</option>
                            <option>$10 - $20</option>
                            <option>$20+</option>
                        </select>

                        <select className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                            <option>Select Rating</option>
                            <option>5 Stars</option>
                            <option>4+ Stars</option>
                            <option>3+ Stars</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                            {filteredProducts.length} Results Found
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <select className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm">
                                <option>{itemsPerPage}</option>
                                <option>32</option>
                                <option>48</option>
                            </select>
                        </div>

                        <div className="flex items-center border border-border rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                                aria-label="Grid view"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                                aria-label="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="hidden lg:block">
                        <Sidebar
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                        />
                    </div>

                    {showMobileFilters && (
                        <Sidebar
                            isMobile={true}
                            onClose={() => setShowMobileFilters(false)}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                        />
                    )}

                    <div className="flex-1">
                        {paginatedProducts.length > 0 ? (
                            <>
                                <ProductsGrid
                                    products={paginatedProducts}
                                    viewMode={viewMode}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                />
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Newsletter />
            <CartPopup isOpen={showCartPopup} onClose={() => setShowCartPopup(false)} />
        </div>
    );
};

export default ProductsPage