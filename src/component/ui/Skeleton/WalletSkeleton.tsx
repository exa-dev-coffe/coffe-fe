const WalletSkeleton: React.FC = () => {
    return (
        <div className={'bg-white dark:bg-gray-800 animate-pulse p-8 rounded-2xl mt-10'}>
            <div className={'h-[600px] max-w-3xl bg-gray-300 dark:bg-gray-700 rounded-2xl mx-auto'}/>
            <div className={'h-10 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto mt-10 w-32'}/>
            <div className={'h-10 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto mt-10 w-52'}/>
            <div className={'h-10 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto mt-10 w-36'}/>
        </div>
    )
}

export default WalletSkeleton;