import React from "react";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import {HiOutlineTrash, HiOutlineMail} from "react-icons/hi";

export interface BaristaCardProps {
    id: number;
    fullName: string;
    email: string;
    photo?: string | null;
    onDelete: (id: number) => void;
}

export const BaristaCard: React.FC<BaristaCardProps> = ({
    id,
    fullName,
    email,
    photo,
    onDelete,
}) => {
    return (
        <Card variant="interactive" className="group">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <UserAvatar src={photo} name={fullName} size="md" />
                    <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {fullName}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                            <HiOutlineMail className="shrink-0" />
                            <span>{email}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(id)}
                        className="px-2.5"
                        title="Remove Barista"
                    >
                        <HiOutlineTrash className="text-sm" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default BaristaCard;
