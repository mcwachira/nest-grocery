"use client"
import CategoryCard from "@/src/components/categories/CateogryCard.tsx";
import {ChevronRight} from "lucide-react";
import ProductCard from "@/src/components/products/ProductCard.tsx";
import {allProducts, categories} from "@/src/lib/data.ts";
import BreadCrumbs from "@/src/components/common/BreadCrumbs.tsx";
import {useState} from "react";
import {useRouter} from "next/navigation";




type ViewMode = 'categories' | 'products';

const CategoriesPage = () => {
    const [currentView, setCurrentView] = useState<ViewMode>('categories');
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');

    const router = useRouter();

    const handleCategoryClick = (slug: string) => {
        setSelectedCategorySlug(slug);
        setCurrentView('products');
    };

    const handleBackToCategories = () => {
        setCurrentView('categories');
        setSelectedCategorySlug('');
    };

    const handleProductClick = (product: Product) => {
        // Navigate to product detail page
        console.log(`Navigate to product ${product.id} detail page`);
       router.push(`/products/${product.id}`);
    };

    const handleAddToCart = (product: Product) => {
        console.log(`Adding ${product.name} to cart`);
        // Add to cart logic here
    };

    const handleToggleWishlist = (product: Product) => {
        console.log(`Toggle wishlist for ${product.name}`);
        // Wishlist logic here
    };

    const selectedCategory = categories.find(cat => cat.slug === selectedCategorySlug);
    const filteredProducts = allProducts.filter(product => product.categorySlug === selectedCategorySlug);

    return (
        <div className="min-h-screen bg-background">
            {currentView === 'categories' ? (
                <>
                    <BreadCrumbs items={[{ label: 'Categories' }]} />

                    <main className="container mx-auto px-4 py-8">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-foreground mb-4">
                                Shop by Categories
                            </h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Browse through our wide range of categories and discover quality products for your everyday needs.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    onClick={() => handleCategoryClick(category.slug)}
                                />
                            ))}
                        </div>
                    </main>
                </>
            ) : (
                <>
                    <Breadcrumb
                        items={[
                            { label: 'Categories', onClick: handleBackToCategories },
                            { label: selectedCategory?.name || 'Category' }
                        ]}
                    />

                    <main className="container mx-auto px-4 py-8">
                        <div className="mb-8">
                            <button
                                onClick={handleBackToCategories}
                                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                                <span className="ml-2">Back to Categories</span>
                            </button>

                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground mb-2">
                                        {selectedCategory?.name}
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                                    </p>
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        viewMode="grid"
                                        onProductClick={handleProductClick}
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={handleToggleWishlist}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No products found
                                </h3>
                                <p className="text-muted-foreground">
                                    There are no products in this category yet.
                                </p>
                                <button
                                    onClick={handleBackToCategories}
                                    className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Browse Other Categories
                                </button>
                            </div>
                        )}
                    </main>
                </>
            )}
        </div>
    );
};

export default CategoriesPage;