import { Eye, Heart, Share2, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/src/lib/types";

interface ProductCardProps {
    product: Product;
    viewMode?: 'grid' | 'list';
    onProductClick: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
    onToggleWishlist?: (product: Product) => void;
    onShare?: (product: Product) => void;
}

const ProductCard = ({
                         product,
                         viewMode = 'grid',
                         onProductClick,
                         onAddToCart,
                         onToggleWishlist,
                         onShare
                     }: ProductCardProps) => {

    const handleProductClick = () => {
        onProductClick(product);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart?.(product);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleWishlist?.(product);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare?.(product);
    };

    if (viewMode === "list") {
        return (
            <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300">
                <div
                    className="relative cursor-pointer flex-shrink-0"
                    onClick={handleProductClick}
                >
                    {product.sale && (
                        <span className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium z-10">
                            Sale 50%
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="absolute -top-2 -right-2 bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium z-10">
                            Out of Stock
                        </span>
                    )}
                    <div className="w-20 h-20 flex items-center justify-center text-4xl">
                        {product.image}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3
                        className="font-medium text-foreground mb-2 cursor-pointer hover:text-primary transition-colors truncate"
                        onClick={handleProductClick}
                    >
                        {product.name}
                    </h3>

                    <div className="flex items-center mb-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                        onClick={handleProductClick}
                        className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        aria-label="View product"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {onToggleWishlist && (
                        <button
                            onClick={handleToggleWishlist}
                            className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                            aria-label="Add to wishlist"
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    )}
                    {onAddToCart && product.inStock && (
                        <button
                            onClick={handleAddToCart}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="hidden sm:inline">Add to Cart</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 relative">
            {product.sale && (
                <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium z-10">
                    Sale 50%
                </span>
            )}

            {!product.inStock && (
                <span className="absolute top-2 right-2 bg-muted text-muted-foreground px-2 py-1 rounded text-xs font-medium z-10">
                    Out of Stock
                </span>
            )}

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1 z-20">
                <button
                    onClick={handleProductClick}
                    className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    aria-label="View product"
                >
                    <Eye className="w-4 h-4" />
                </button>
                {onToggleWishlist && (
                    <button
                        onClick={handleToggleWishlist}
                        className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                        aria-label="Add to wishlist"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                )}
                {onShare && (
                    <button
                        onClick={handleShare}
                        className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                        aria-label="Share product"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div
                className="text-center mb-4 cursor-pointer"
                onClick={handleProductClick}
            >
                <div className="text-6xl mb-4">{product.image}</div>
                <h3 className="font-medium text-foreground mb-2 hover:text-primary transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-center justify-center mb-3">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {onAddToCart && product.inStock && (
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-primary/90 flex items-center justify-center space-x-2"
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                </button>
            )}

            {!product.inStock && (
                <div className="w-full bg-muted text-muted-foreground py-2 rounded-lg font-medium text-center">
                    Out of Stock
                </div>
            )}
        </div>
    );
};

export default ProductCard;