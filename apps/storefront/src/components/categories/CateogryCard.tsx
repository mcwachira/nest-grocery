import { ChevronRight } from "lucide-react";
import { Category } from "@/src/lib/types";

interface CategoryCardProps {
    category: Category;
    onClick: () => void;
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
    return (
        <div
            onClick={onClick}
            className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 text-6xl flex items-center justify-center pointer-events-none">
                {category.image}
            </div>

            <div className="relative z-10">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </span>
                    <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
    );
};

export default CategoryCard;