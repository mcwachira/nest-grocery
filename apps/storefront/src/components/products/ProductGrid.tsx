import ProductCard from "@/src/components/products/ProductCard.tsx";

const ProductsGrid = ({ products, viewMode, onProductClick }) => {

    console.log(products)
    return (
        <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onProductClick={onProductClick}
                />
            ))}
        </div>
    );
};
export default ProductsGrid;