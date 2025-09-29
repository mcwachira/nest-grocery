interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

const Pagination = ({
                        currentPage,
                        totalPages,
                        onPageChange,
                        maxVisiblePages = 5
                    }: PaginationProps) => {
    const getPageNumbers = (): (number | string)[] => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [1];

        if (currentPage > 3) {
            pages.push('...');
        }

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button
                className={`px-4 py-2 rounded-lg border border-border font-medium transition-colors ${
                    currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted'
                }`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                ←
            </button>

            {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                            currentPage === page
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border hover:bg-muted'
                        }`}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            {page}
          </span>
                )
            ))}

            <button
                className={`px-4 py-2 rounded-lg border border-border font-medium transition-colors ${
                    currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted'
                }`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                →
            </button>
        </div>
    );
};

export default Pagination;