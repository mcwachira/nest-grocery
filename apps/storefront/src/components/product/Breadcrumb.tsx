import Link from "next/link";
import {ChevronRight} from "lucide-react";

const Breadcrumb = () => {
    return (
        <nav className="bg-muted py-4">
            <div className="container mx-auto px-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-primary">🏠</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="#" className="hover:text-primary">Category</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="#" className="hover:text-primary">Vegetables</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-primary">Chinese Cabbage</span>
                </div>
            </div>
        </nav>
    );
};

export default Breadcrumb