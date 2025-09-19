import React from 'react';
import { type PageInfo } from '../type/logintype';
import '../pages/admin/UserManagementPage.css'; // CSS 재활용

interface Props {
    pi: PageInfo;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ pi, onPageChange }) => {
    
    const pageButtons = [];
    if (pi) {
        for (let i = pi.startPage; i <= pi.endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={i === pi.currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(pi.currentPage - 1)}
                disabled={pi.currentPage === 1}
            >
                &lt;
            </button>
            {pageButtons}
            <button
                onClick={() => onPageChange(pi.currentPage + 1)}
                disabled={pi.currentPage === pi.maxPage}
            >
                &gt;
            </button>
        </div>
    );
};

export default Pagination;