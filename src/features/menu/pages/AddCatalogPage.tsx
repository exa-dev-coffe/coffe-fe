import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAddMenuMutation } from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Input from "@/components/ui/Input.tsx";
import Textarea from "@/components/ui/Textarea.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import ImageUpload from "@/components/ui/ImageUpload.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import Button from "@/components/ui/Button.tsx";
import { HiOutlineArrowLeft, HiOutlinePlus } from "react-icons/hi";
import CategoryModal from "@/features/categories/components/CategoryModal.tsx";
import type { CategoryItem } from "@/features/categories/types/category.types";

export const AddCatalogPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    mutateAsync: addMenu,
    isPending: loading,
    error: addError,
  } = useAddMenuMutation();
  const { data: categories = [] } = useCategoryOptionsQuery();

  const optionsCategory: DropdownOption[] = categories.map(
    (c: CategoryItem) => ({
      value: Number(c.id),
      label: c.name,
    }),
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<DropdownOption | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setPrice("");
      return;
    }
    const formattedValue = new Intl.NumberFormat("id-ID").format(
      Number(rawValue),
    );
    setPrice(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMenu({
        name,
        description,
        price: Number(String(price).replace(/\./g, "")),
        categoryId: selectedCategory?.value
          ? Number(selectedCategory.value)
          : undefined,
        photo,
        isAvailable,
      });
      navigate("/dashboard/manage-catalog");
    } catch {
      // Validation errors are handled globally or accessible via addError
    }
  };

  const errors = (addError as unknown as Record<string, string>) || {};

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Add New Catalog Item"
        subtitle="Create a new beverage or culinary offering for the coffee menu."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Catalog", to: "/dashboard/manage-catalog" },
          { label: "Add Item" },
        ]}
        action={
          <Link to="/dashboard/manage-catalog">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<HiOutlineArrowLeft />}
            >
              Back to Catalog
            </Button>
          </Link>
        }
      />

      <Card variant="dashboard">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              placeholder="e.g. Caramel Macchiato Roast"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Price (IDR)"
              type="text"
              placeholder="e.g. 35.000"
              value={price}
              onChange={handlePriceChange}
              error={errors.price}
              required
            />
          </div>

          <Dropdown
            label="Assign Category (Optional)"
            placeholder="Select category..."
            options={optionsCategory}
            value={selectedCategory}
            setValue={setSelectedCategory}
            footerAction={{
              label: (
                <>
                  <HiOutlinePlus className="text-sm" /> Add New Category
                </>
              ),
              onClick: () => setShowCategoryModal(true),
            }}
          />

          <Textarea
            label="Description & Flavor Profile"
            placeholder="Describe the bean origin, tasting notes, roast profile, or ingredients..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
          />

          <ImageUpload
            label="Product Photo"
            value={photo}
            onChange={setPhoto}
            required
          />

          <div className="pt-2">
            <Checkbox
              label="Set item as Available immediately in kitchen inventory"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link to="/dashboard/manage-catalog">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={loading}>
              Publish Product
            </Button>
          </div>
        </form>
      </Card>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={(newCategory) => {
          setSelectedCategory({
            value: newCategory.id,
            label: newCategory.name,
          });
        }}
      />
    </div>
  );
};

export default AddCatalogPage;
