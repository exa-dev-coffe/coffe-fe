import React, {useState} from "react";
import {HiStar} from "react-icons/hi";

export interface RatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    onRate?: (rating: number) => void;
    showNumber?: boolean;
    className?: string;
}

export const Rating: React.FC<RatingProps> = ({
    rating,
    maxRating = 5,
    size = "md",
    readonly = true,
    onRate,
    showNumber = false,
    className = "",
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizeClasses = {
        sm: "text-sm gap-0.5",
        md: "text-lg gap-1",
        lg: "text-2xl gap-1.5",
    }[size];

    const currentRating = hoverRating !== null ? hoverRating : rating;

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className={`flex items-center ${sizeClasses}`}>
                {Array.from({length: maxRating}, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = currentRating >= starValue;
                    return (
                        <button
                            type="button"
                            key={i}
                            disabled={readonly}
                            onClick={() => onRate && onRate(starValue)}
                            onMouseEnter={() => !readonly && setHoverRating(starValue)}
                            onMouseLeave={() => !readonly && setHoverRating(null)}
                            className={`transition-transform duration-150 ${
                                readonly ? "cursor-default" : "cursor-pointer hover:scale-125"
                            } ${isFilled ? "text-amber-400 dark:text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                            aria-label={`Rate ${starValue} stars`}
                        >
                            <HiStar />
                        </button>
                    );
                })}
            </div>
            {showNumber && (
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ({rating.toFixed(1)})
                </span>
            )}
        </div>
    );
};

export default Rating;
