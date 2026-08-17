import React from "react";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import {formatDateTime} from "@/core/utils/formatters.ts";
import {HiOutlinePencilAlt, HiOutlineTrash, HiOutlineDesktopComputer} from "react-icons/hi";

export interface TableCardProps {
    id: number;
    name: string;
    updatedAt?: string;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
    id,
    name,
    updatedAt,
    onEdit,
    onDelete,
}) => {
    return (
        <Card variant="interactive" className="group">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
                        <HiOutlineDesktopComputer />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {name}
                        </h4>
                        {updatedAt && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Updated {formatDateTime(updatedAt)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(id)}
                        className="px-2.5"
                        title="Edit Table"
                    >
                        <HiOutlinePencilAlt className="text-sm" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(id)}
                        className="px-2.5"
                        title="Delete Table"
                    >
                        <HiOutlineTrash className="text-sm" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TableCard;
