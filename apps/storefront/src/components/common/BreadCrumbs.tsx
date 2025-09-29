import Link from "next/link";
import {ChevronRight} from "lucide-react";

interface BreadcrumbItem {
    label:string;
    href?: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}
const BreadCrumbs = ({ items }:BreadcrumbProps) => {
    return (
        <nav className="bg-muted py-4">
            <div className="container mx-auto px-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">
                        🏠
                    </Link>
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        return (
                            <div key={index} className="flex items-center space-x-2">
                                <ChevronRight className="w-4 h-4" />
                                {isLast ? (
                                    <span className="text-primary font-medium">
                                        {item.label}
                                    </span>
                                ) : item.onClick ? (
                                    <button
                                        onClick={item.onClick}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                ) : item.href ? (
                                    <Link
                                        href={item.href}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span>{item.label}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default BreadCrumbs;