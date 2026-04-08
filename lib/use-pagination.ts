import { useState } from 'react';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export function usePagination(totalItems: number, itemsPerPage: number = 10): PaginationState & {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
} {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages: totalPages || 1,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
  };
}
