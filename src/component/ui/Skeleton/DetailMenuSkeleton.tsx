const DetailMenuSkeleton = () => {
    return (
        <>
            <div className={'bg-white animate-pulse flex mt-10 p-8 rounded-2xl justify-between items-center'}>
                <div className={'bg-gray-300 animate-pulse w-20 h-6'}></div>
                <div className={'flex items-center text-2xl gap-1'}>
                    {
                        Array.from({length: 5}).map((_, index: number) => {
                            return (
                                <span key={index} className={'text-gray-500'}>
                                    <div className={'bg-gray-300 animate-pulse w-6 h-6 rounded-full'}></div>
                                </span>
                            );
                        })
                    }
                    <div className={'bg-gray-300 animate-pulse ms-4 w-12 h-6 rounded'}></div>
                </div>
            </div>
            <div className={'flex gap-5 mt-10 w-full'}>
                <div className={'mt-10 shrink-0 w-96 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                    <div className={'w-96 h-96 bg-gray-300 animate-pulse rounded-2xl'}></div>
                </div>
                <div className={'mt-10 flex flex-col grow bg-white p-8 rounded-2xl'}>
                    <div className={'bg-gray-300 animate-pulse w-3/4 h-8 mb-4'}></div>
                    <div className={'flex items-center gap-2 text-xl'}>
                        <div className={'bg-gray-300 animate-pulse w-24 h-6'}></div>
                        <span className={'text-gray-400'}>|</span>
                        <p className={'bg-gray-300 animate-pulse w-32 h-6'}></p>
                    </div>
                    <p className={'text-gray-600 mt-8 bg-gray-300 animate-pulse h-[200px]'}></p>
                    <div className={'mt-auto ms-auto '}>
                        <button
                            className={'btn-tertiary px-6 font-bold py-3 block bg-gray-300 animate-pulse rounded-2xl'}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default DetailMenuSkeleton;