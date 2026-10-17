type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

// Builds: 1 2 3 4 5 ... 26   |   1 ... 9 10 11 ... 26   |   1 ... 22 23 24 25 26
function getPages(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (page >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <p className="record-range">
        Showing {start}–{end} of {totalItems} students
      </p>

      <nav className="pagination" aria-label="Pagination">
        <button
          type="button"
          className="page-button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        {totalPages > 1 &&
          getPages(page, totalPages).map((p, index) =>
            p === "..." ? (
              <span key={`dots-${index}`} className="pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className="page-button"
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}

        <button
          type="button"
          className="page-button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}