import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import type {queryPaginate} from "../model";

interface PaginationDashboardProps {
    currentPage: number;
    totalData: number;
    onPageChange: (page: number, query: queryPaginate, endpoint?: string) => void;
    query: queryPaginate;
    endpoint?: string;
}

const PaginationDashboard: React.FC<PaginationDashboardProps> = ({
                                                                     currentPage,
                                                                     query,
                                                                     onPageChange,
                                                                     totalData,
                                                                     endpoint,
                                                                 }) => {

    const previewNextPage = () => {
        const totalPage = Math.ceil(totalData / 10);
        if (totalPage < 5) {
            return Array.from({length: totalPage}, (_, i) => i + 1);
        } else {
            if (currentPage <= 3) {
                return [1, 2, 3, 4, '...'];
            } else if (currentPage >= totalPage - 3) {
                return ['...', totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage];
            } else {
                return ['...', currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, '...'];
            }
        }
    }

    const handleNextPage = () => {
        const totalPage = Math.ceil(totalData / 10);
        if (totalPage === 0 || currentPage >= totalPage) return;
        onPageChange(currentPage + 1, query, endpoint);
    }

    const handlePrevPage = () => {
        if (currentPage <= 1) return;
        onPageChange(currentPage - 1, query, endpoint);
    }

    return (
        <div className={'flex sm:text-2xl text-sm gap-2 sm:gap-4 items-center mt-8'}>
            <FaChevronLeft
                onClick={handlePrevPage}
                className={` ${currentPage > 1 ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed text-gray-300'}`}
            />
            {
                previewNextPage().map((item, index) => (
                    <button
                        key={index}
                        className={`${currentPage === item ? 'active-paginator-dashboard' : item === '...' ? 'paginator-dashboard-placeholder' : 'paginator-dashboard'}`}
                        disabled={currentPage === item || item === '...'}
                        onClick={
                            () => {
                                if (item !== '...') {
                                    onPageChange(item as number, query, endpoint);
                                }
                            }
                        }
                    >
                        {item}
                    </button>
                ))
            }
            <FaChevronRight
                onClick={handleNextPage}
                className={` ${currentPage < Math.ceil(totalData / 10) ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed text-gray-300'}`}
            />
        </div>
    )
}

export default PaginationDashboard;