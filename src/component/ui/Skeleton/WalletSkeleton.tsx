const WalletSkeleton = () => {
    return (
        <div className={'bg-white animate-pulse p-8 rounded-2xl mt-10'}>
            <div className={'h-[600px] max-w-3xl animate-pulse bg-gray-300 rounded-2xl mx-auto'}></div>
            <div className={'h-10 animate-pulse bg-gray-300 rounded-xl mx-auto mt-10 w-32'}></div>
            <div className={'h-10 animate-pulse bg-gray-300 rounded-xl mx-auto mt-10 w-52'}></div>
            <div className={'h-10 animate-pulse bg-gray-300 rounded-xl mx-auto mt-10 w-36'}></div>
        </div>
    )
}

export default WalletSkeleton;