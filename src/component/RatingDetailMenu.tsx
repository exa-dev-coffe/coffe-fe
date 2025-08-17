import {IoStarSharp} from "react-icons/io5";

interface RatingDetailMenuProps {
    rating: number
}

const RatingDetailMenu: React.FC<RatingDetailMenuProps> = ({rating}) => {

    const ratingPercentage = (rating / 5) * 100;

    return (
        <div className={'flex items-center relative'}>
            <div className={'text-gray-300 flex items-center text-2xl'}>
                {
                    Array.from({length: 5}).map((_, index: number) => {
                        return (
                            <span key={index} className={'text-gray-500'}>
                                <IoStarSharp className={''}/>
                            </span>
                        );
                    })
                }
            </div>
            <div
                className={'text-yellow-400 flex items-center text-2xl absolute overflow-hidden'}
                style={{width: `${ratingPercentage}%`}}
            >
                <div className={'flex items-center'}
                >
                    {
                        Array.from({length: 5}).map((_, index: number) => {
                            return (
                                <span key={index} className={''}>
                                <IoStarSharp className={''}/>
                            </span>
                            );
                        })
                    }
                </div>
            </div>
        </div>

    )
}

export default RatingDetailMenu;