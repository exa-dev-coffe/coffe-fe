const WalletSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl mt-10 space-y-6">
            <div className="h-[600px] max-w-3xl shimmer rounded-2xl mx-auto"/>
            <div className="h-10 shimmer rounded-xl mx-auto w-32"/>
            <div className="h-10 shimmer rounded-xl mx-auto w-52"/>
            <div className="h-10 shimmer rounded-xl mx-auto w-36"/>
        </div>
    )
}

export default WalletSkeleton;