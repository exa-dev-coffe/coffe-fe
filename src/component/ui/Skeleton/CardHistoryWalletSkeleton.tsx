const CardHistoryWalletSkeleton = () => {
    return (
        <div className="w-full border-y border-gray-300 dark:border-gray-700 h-36 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center h-full px-4">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 shimmer rounded-md"/>
                    <div className="space-y-2">
                        <div className="w-24 h-6 shimmer rounded"/>
                        <div className="w-40 h-6 shimmer rounded"/>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="w-36 h-6 shimmer rounded"/>
                    <div className="w-28 h-8 shimmer rounded"/>
                </div>
            </div>
        </div>
    )
}

export default CardHistoryWalletSkeleton;