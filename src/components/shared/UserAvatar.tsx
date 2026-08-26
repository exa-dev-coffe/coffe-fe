import React from "react";
import DummyProfile from "@/assets/images/dummyProfile.png";

export interface UserAvatarProps {
    src?: string | null;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name = "User",
    size = "md",
    className = "",
}) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-base",
        xl: "w-24 h-24 text-xl",
    }[size];

    return (
        <div
            className={`relative rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-amber-500/10 dark:bg-amber-500/20 ${sizeClasses} ${className}`}
        >
            <img
                src={src || DummyProfile}
                alt={name}
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DummyProfile;
                }}
                className="w-full h-full object-cover rounded-full"
            />
        </div>
    );
};

export default UserAvatar;
