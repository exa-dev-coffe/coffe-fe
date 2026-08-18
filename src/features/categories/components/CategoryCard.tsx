import React from "react";
import { Link } from "react-router";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import { HiOutlineTag, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import DynamicIcon from "@/components/ui/DynamicIcon.tsx";

export interface CategoryCardProps {
  id: number;
  name: string;
  icon?: string;
  productCount?: number;
  onDelete: (id: number) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  icon,
  onDelete,
}) => {
  return (
    <Card variant="interactive" className="group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            {icon ? <DynamicIcon name={icon} /> : <HiOutlineTag />}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {name}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Category ID #{id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/dashboard/manage-category/list-category/${id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="px-2.5"
              title="View Products in Category"
            >
              <HiOutlineEye className="text-sm" />
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(id)}
            className="px-2.5"
            title="Delete Category"
          >
            <HiOutlineTrash className="text-sm" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
