export const RECORDS_PER_PAGE = 200;

export function getPaginationState(totalItems, currentPage, pageSize = RECORDS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(Number(currentPage) || 1, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    currentPage: safePage,
    totalPages,
    startIndex,
    endIndex,
    pageSize
  };
}

export function paginateItems(items, currentPage, pageSize = RECORDS_PER_PAGE) {
  const pagination = getPaginationState(items.length, currentPage, pageSize);
  return {
    pagination,
    items: items.slice(pagination.startIndex, pagination.endIndex)
  };
}

export function renderPaginationControls(pagination, totalItems) {
  if (totalItems <= pagination.pageSize) {
    return "";
  }

  return `
    <div class="pagination-summary">
      Showing ${pagination.startIndex + 1}-${pagination.endIndex} of ${totalItems}
    </div>
    <div class="pagination-actions" aria-label="Pagination controls">
      <button class="secondary-button compact-button" type="button" data-pagination-action="previous" ${pagination.currentPage === 1 ? "disabled" : ""}>Previous</button>
      <span class="pagination-page">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
      <button class="secondary-button compact-button" type="button" data-pagination-action="next" ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;
}
