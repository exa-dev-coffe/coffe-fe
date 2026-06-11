const DetailTransactionSkeleton = () => {
    return (
        <div className="w-full border-y p-8 rounded-2xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="w-64 h-10 shimmer rounded-md"/>
            <div className="flex justify-between mt-10">
                <div className="space-y-2">
                    <div className="w-48 h-6 shimmer rounded-md"/>
                    <div className="w-48 h-6 shimmer rounded-md"/>
                    <div className="w-48 h-6 shimmer rounded-md"/>
                </div>
                <div className="w-32 h-6 shimmer rounded-md"/>
            </div>
            {Array.from({length: 3}).map((_, index) => (
                <div key={index} className="flex md:flex-row flex-col gap-6 mt-10">
                    <div className="w-44 md:w-64 h-44 md:h-64 shimmer rounded-md"/>
                    <div className="w-10 h-10 shimmer rounded-md"/>
                    <div className="grow space-y-6">
                        <div className="w-52 h-10 shimmer rounded-md"/>
                        <div className="w-full h-10 shimmer rounded-md"/>
                        <div className="w-full h-10 shimmer rounded-md"/>
                        <div className="flex gap-4 mt-10">
                            <div className="w-32 h-8 shimmer rounded-md"/>
                            <div className="flex gap-2">
                                {Array.from({length: 5}).map((_, starIndex) => (
                                    <div key={starIndex} className="w-6 h-6 shimmer rounded-full"/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex justify-between mt-10">
                <div className="w-24 sm:w-32 h-10 shimmer rounded-md"/>
                <div className="w-24 sm:w-32 h-10 shimmer rounded-md"/>
            </div>
        </div>
    )
}

export default DetailTransactionSkeleton;