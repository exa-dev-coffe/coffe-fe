const DetailMenuSkeleton = () => {
    return (
        <>
            <div className="bg-white dark:bg-gray-800 flex mt-10 gap-5 p-8 rounded-2xl sm:flex-row flex-col justify-between items-center">
                <div className="shimmer w-20 h-6 rounded"/>
                <div className="flex items-center text-2xl gap-1">
                    {Array.from({length: 5}).map((_, index) => (
                        <div key={index} className="shimmer w-6 h-6 rounded-full"/>
                    ))}
                    <div className="shimmer ms-4 w-12 h-6 rounded"/>
                </div>
            </div>
            <div className="flex gap-5 md:flex-row flex-col mt-10 w-full">
                <div className="mt-10 shrink-0 md:w-96 w-full bg-white dark:bg-gray-800 p-8 rounded-2xl">
                    <div className="w-96 h-96 shimmer rounded-2xl mx-auto"/>
                </div>
                <div className="mt-10 flex flex-col grow bg-white dark:bg-gray-800 p-8 rounded-2xl space-y-4">
                    <div className="shimmer w-3/4 h-8 rounded"/>
                    <div className="flex items-center gap-2">
                        <div className="shimmer w-24 h-6 rounded"/>
                        <div className="shimmer w-32 h-6 rounded"/>
                    </div>
                    <div className="shimmer h-[200px] mt-4 rounded"/>
                    <div className="mt-auto ms-auto shimmer w-40 h-10 rounded-full"/>
                </div>
            </div>
        </>
    )
}

export default DetailMenuSkeleton;