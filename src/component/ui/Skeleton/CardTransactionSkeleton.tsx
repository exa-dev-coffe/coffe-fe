interface CardTransactionSkeletonProps {
    maxItems: number;
}

const CardTransactionSkeleton: React.FC<CardTransactionSkeletonProps> = ({maxItems}) => {
    return (
        <div className={'mt-10 bg-white p-8 rounded-2xl animate-pulse'}>
            <div className="flex justify-between">
                <div className={'w-44 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                <div className={'w-44 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
            </div>
            <div className="flex mt-7 justify-between">
                <div className={'flex justify-start gap-10'}>
                    {
                        Array.from({length: maxItems}).map((_, detailIndex) => (
                            <div key={detailIndex}>
                                <div
                                    className={'xl:w-56 sm:w-44 xl:h-56 sm:h-44 w-28 h-28 bg-gray-300 animate-pulse rounded-xl'}></div>
                                <div className={'w-28 h-6 mt-4 bg-gray-300 animate-pulse rounded-lg'}></div>
                            </div>
                        ))
                    }
                </div>
                <div className={'space-y-4'}>
                    <div className={'w-36 h-10 ms-auto bg-gray-300 animate-pulse rounded-lg'}></div>
                    <div className={'w-28 h-10 ms-auto bg-gray-300 animate-pulse rounded-lg'}></div>
                </div>
            </div>
            <div className={'flex justify-between items-center border-t border-gray-300 mt-7 pt-4'}>
                <div className={'w-48 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                <div className={'w-32 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
            </div>
        </div>
    )
}

export default CardTransactionSkeleton;