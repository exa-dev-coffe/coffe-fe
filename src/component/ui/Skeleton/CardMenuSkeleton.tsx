const CardMenuSkeleton = () => {
    return (
        <div
            className={'flex flex-col sm:w-44 w-28 h-48 sm:h-60 bg-white shadow-lg relative rounded-2xl animate-pulse'}>
            <div className="absolute top-2 right-1 w-6 h-10 rounded-2xl bg-gray-300"></div>
            <div className={'  sm:w-44 w-28  sm:h-44 h-28 bg-gray-300 rounded-2xl'}></div>
            <div className={'grow m-4'}>
                <h5 className={'text-center mt-2 h-5 bg-gray-300 rounded w-3/4 mx-auto'}></h5>
            </div>
        </div>
    )
}

export default CardMenuSkeleton;