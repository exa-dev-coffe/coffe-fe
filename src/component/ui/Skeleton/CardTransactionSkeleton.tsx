const CardTransactionSkeleton = () => {
    return (
        <div className={'mt-10 bg-white p-8 rounded-2xl animate-pulse'}>
            <div className="flex justify-between">
                <div className={'w-44 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                <div className={'w-44 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
            </div>
            <div className="flex mt-7 justify-between">
                <div className={'flex justify-start gap-10'}>
                    <div>
                        <div className={'w-64 h-64 bg-gray-300 animate-pulse rounded-lg'}></div>
                        <div className={'w-64 mt-4 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                    </div>
                    <div>
                        <div className={'w-64 h-64 bg-gray-300 animate-pulse rounded-lg'}></div>
                        <div className={'w-64 mt-4 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                    </div>
                    <div>
                        <div className={'w-64 h-64 bg-gray-300 animate-pulse rounded-lg'}></div>
                        <div className={'w-64 mt-4 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                    </div>
                    <div>
                        <div className={'w-64 h-64 bg-gray-300 animate-pulse rounded-lg'}></div>
                        <div className={'w-64 mt-4 h-10 bg-gray-300 animate-pulse rounded-lg'}></div>
                    </div>
                </div>
                <div className={'space-y-4'}>
                    <div className={'w-44 h-10 ms-auto bg-gray-300 animate-pulse rounded-lg'}></div>
                    <div className={'w-36 h-10 ms-auto bg-gray-300 animate-pulse rounded-lg'}></div>
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