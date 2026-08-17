import React, { useState } from "react";
import Modal from "@/components/ui/Modal.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import { useAddCategoryMutation } from "@/features/categories/hooks/useCategory.ts";
import { HiOutlineTag } from "react-icons/hi";
import type { CategoryItem } from "@/features/categories/types/category.types";
import { useQueryClient } from "@tanstack/react-query";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCategory: CategoryItem) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const { mutateAsync: addCategory, isPending } = useAddCategoryMutation();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await addCategory({ name });
      // addCategory mutation returns { message, data: { id, name } }
      // Let's assume it returns { id, name } inside data.
      // But wait, the backend response might just be a standard message.
      // If the backend returns the created category, we can pass it to onSuccess.
      // If not, we might have to invalidate and rely on the list.
      // In CategoryService.java (backend), addCategory returns ResponseDto<CategoryItem>.

      // To ensure the dropdown updates, we should invalidate the category options query.
      await queryClient.invalidateQueries({ queryKey: ["categoryOptions"] });

      setName("");
      onClose();
      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch {
      // Errors are handled globally
    }
  };

  return (
    <Modal
      show={isOpen}
      handleClose={onClose}
      title="Create New Category"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <InputIcon
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Signature Coffee"
          icon={<HiOutlineTag />}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isPending}>
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
