const CardMenuSkeleton = () => {
    return (
        <div className={'flex flex-col w-44 bg-white shadow-lg h-60 relative rounded-2xl animate-pulse'}>
            <div className="absolute top-2 right-1 w-6 h-10 rounded-2xl bg-gray-300"></div>
            <div className={'   h-44 w-44 bg-gray-300 rounded-2xl'}></div>
            <div className={'grow m-4'}>
                <h5 className={'text-center mt-2 h-5 bg-gray-300 rounded w-3/4 mx-auto'}></h5>
            </div>
        </div>
    )
}

export default CardMenuSkeleton;