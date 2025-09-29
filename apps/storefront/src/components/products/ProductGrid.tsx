import ProductCard from "@/src/components/products/ProductCard.tsx";
import {Product} from "@/src/lib/types.ts";



interface ProductGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    onProductClick: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleWishlist?: (product: Product) => void;
    onShare?: (product: Product) => void;
}

const ProductsGrid = ({
                          products,
                          viewMode,
                          onProductClick,
                          onAddToCart,
                          onToggleWishlist,
                          onShare
                      }: ProductGridProps) => {
    return (
        <div className={
            viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
        }>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onProductClick={onProductClick}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    onShare={onShare}
                />
            ))}
        </div>
    );
};

export default ProductsGrid;