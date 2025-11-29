import {IoStarSharp} from "react-icons/io5";

const DetailMenuSkeleton = () => {
    return (
        <>
            <div
                className={'bg-white dark:bg-gray-800 animate-pulse flex mt-10 gap-5 p-8 rounded-2xl sm:flex-row flex-col justify-between items-center'}>
                <div className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-20 h-6'}></div>
                <div className={'flex items-center text-2xl gap-1'}>
                    {
                        Array.from({length: 5}).map((_, index: number) => {
                            return (
                                <IoStarSharp key={index}
                                             className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-6 h-6 rounded-full'}></IoStarSharp>
                            );
                        })
                    }
                    <div className={'bg-gray-300 dark:bg-gray-700 animate-pulse ms-4 w-12 h-6 rounded'}></div>
                </div>
            </div>
            <div className={'flex gap-5 md:flex-row flex-col mt-10 w-full'}>
                <div
                    className={'mt-10 shrink-0 md:w-96 w-full bg-white dark:bg-gray-800 p-8 rounded-2xl flex justify-between items-center'}>
                    <div className={'w-96 h-96 bg-gray-300 dark:bg-gray-700 mx-auto animate-pulse rounded-2xl'}></div>
                </div>
                <div className={'mt-10 flex flex-col grow bg-white dark:bg-gray-800 p-8 rounded-2xl'}>
                    <div className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-3/4 h-8 mb-4'}></div>
                    <div className={'flex items-center gap-2 text-xl'}>
                        <div className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-24 h-6'}></div>
                        <span className={'text-gray-400 dark:text-gray-400'}>|</span>
                        <p className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-32 h-6'}></p>
                    </div>
                    <div className={'bg-gray-300 dark:bg-gray-700 animate-pulse h-[200px] mt-8 rounded'}></div>
                    <div className={'mt-auto ms-auto '}>
                        <div
                            className={'bg-gray-300 dark:bg-gray-700 animate-pulse w-40 h-10 mt-10 rounded-full'}></div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default DetailMenuSkeleton;