import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import type {queryPaginate} from "../model";

interface PaginationDashboardProps {
    currentPage: number;
    totalData: number;
    onPageChange: (page: number, query: queryPaginate, isCustom: boolean, endpoint?: string) => void;
    query: queryPaginate;
    isCustom?: boolean;
    endpoint?: string;
}

const PaginationDashboard: React.FC<PaginationDashboardProps> = ({
                                                                     currentPage,
                                                                     query,
                                                                     onPageChange,
                                                                     totalData,
                                                                     endpoint,
                                                                     isCustom = false
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
        onPageChange(currentPage + 1, query, isCustom, endpoint);
    }

    const handlePrevPage = () => {
        if (currentPage <= 1) return;
        onPageChange(currentPage - 1, query, isCustom, endpoint);
    }

    return (
        <div className={'flex gap-4 items-center mt-8'}>
            <FaChevronLeft
                onClick={handlePrevPage}
                className={`text-2xl ${currentPage > 1 ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed text-gray-300'}`}
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
                                    onPageChange(item as number, query, isCustom, endpoint);
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
                className={`text-2xl ${currentPage < Math.ceil(totalData / 10) ? 'hover:cursor-pointer' : 'hover:cursor-not-allowed text-gray-300'}`}
            />
        </div>
    )
}

export default PaginationDashboard;