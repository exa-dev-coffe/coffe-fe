const CardMenuSkeleton = () => {
    return (
        <div className="flex flex-col sm:w-44 w-28 h-48 sm:h-60 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 dark:shadow-none shadow-lg relative rounded-2xl overflow-hidden">
            <div className="absolute top-2 right-1 w-6 h-10 rounded-2xl shimmer"/>
            <div className="sm:w-44 w-28 sm:h-44 h-28 shimmer"/>
            <div className="grow m-4">
                <div className="h-5 shimmer rounded w-3/4 mx-auto"/>
            </div>
        </div>
    )
}

export default CardMenuSkeleton;