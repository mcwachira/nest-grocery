const Pagination = ({ currentPage, totalPages, onPageChange }) => {


    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    currentPage === 1 ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                }`}
                onClick={() => onPageChange(1)}
            >
                1
            </button>

            {[2, 3, 4, 5].map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                        currentPage === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                    }`}
                >
                    {page}
                </button>
            ))}
            {totalPages > 5 && (
                <>
                    <span className="px-2">...</span>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center font-medium hover:bg-muted transition-colors"
                    >
                        {totalPages}
                    </button>
                </>
            )}
            <button
                className="px-4 py-2 rounded-lg border border-border font-medium hover:bg-muted transition-colors"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            >
                →
            </button>
        </div>
    );
};

export default Pagination