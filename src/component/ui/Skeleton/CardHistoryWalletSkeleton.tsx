const CardHistoryWalletSkeleton = () => {
    return (
        <div className={'w-full border-y border-gray-300 h-36 bg-white animate-pulse'}>
            <div className={'flex justify-between items-center h-full'}>
                <div className={'flex items-center gap-4'}>
                    <div className={'w-24 h-24 bg-gray-200 rounded-md'}></div>
                    <div className={'space-y-2'}>
                        <div className={'w-24 h-6 bg-gray-200 rounded'}></div>
                        <div className={'w-40 h-6 bg-gray-200 rounded'}></div>
                    </div>
                </div>
                <div className={'flex flex-col items-end gap-2'}>
                    <div className={'w-36 h-6 bg-gray-200 rounded'}></div>
                    <div className={'w-28 h-8 bg-gray-200 rounded'}></div>
                </div>
            </div>
        </div>
    )
}


export default CardHistoryWalletSkeleton;