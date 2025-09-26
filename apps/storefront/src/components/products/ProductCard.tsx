import {Eye, Heart, Share2, ShoppingCart, Star} from "lucide-react";

const ProductCard = ({ product, viewMode = 'grid', onProductClick }) => {

    const handleProductClick = () => {
        onProductClick(product)
    }

    if(viewMode === "list") {

        return (
            <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition-all duration-300">

                <div className="relative cursor-pointer" onClick={handleProductClick}>

                    {product.sale && (
                        <span className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium z-10">
              Sale 50%
            </span>
                    )}
                    <div className="w-20 h-20 flex items-center justify-center text-4xl">
                        {product.image}
                    </div>
                </div>



                <div className="flex-1">
                    <h3
                        className="font-medium text-foreground mb-2 cursor-pointer hover:text-primary"
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
                        <span className="text-lg font-bold text-foreground">${product.price}</span>
                        {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleProductClick}
                        className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                        <Heart className="w-4 h-4" />
                    </button>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>

            )
    }


    return (
        <div className="group bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 relative">
            {product.sale && (
                <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium z-10">
          Sale 50%
        </span>
            )}

            {product.featured && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-10">
          Out of Stock
        </span>
            )}

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                <button
                    onClick={handleProductClick}
                    className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            <div className="text-center mb-4 cursor-pointer" onClick={handleProductClick}>
                <div className="text-6xl mb-4">{product.image}</div>
                <h3 className="font-medium text-foreground mb-2 hover:text-primary transition-colors">{product.name}</h3>

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
                    <span className="text-lg font-bold text-foreground">${product.price}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                </div>
            </div>

            <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-primary/90 flex items-center justify-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
            </button>
        </div>
    );
};

export default ProductCard