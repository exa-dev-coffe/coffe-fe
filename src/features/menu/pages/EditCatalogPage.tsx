import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  useMenuDetailQuery,
  useUpdateMenuMutation,
} from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Input from "@/components/ui/Input.tsx";
import Textarea from "@/components/ui/Textarea.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import ImageUpload from "@/components/ui/ImageUpload.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import Button from "@/components/ui/Button.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { HiOutlineArrowLeft, HiOutlinePlus } from "react-icons/hi";
import type { CategoryItem } from "@/features/categories/types/category.types";
import CategoryModal from "@/features/categories/components/CategoryModal.tsx";

export const EditCatalogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const menuId = Number(id);
  const { data: menuData, isLoading: queryLoading } =
    useMenuDetailQuery(menuId);
  const {
    mutateAsync: updateMenu,
    isPending: updateLoading,
    error: updateError,
  } = useUpdateMenuMutation();
  const { data: categories = [] } = useCategoryOptionsQuery();

  const optionsCategory: DropdownOption[] = categories.map(
    (c: CategoryItem) => ({ value: Number(c.id), label: c.name }),
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<DropdownOption | null>(null);
  const [photo, setPhoto] = useState<File | string | null>(null);
  const [photoBefore, setPhotoBefore] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (menuData && !isInitialized) {
      setName(menuData.name);
      setDescription(menuData.description);
      setPrice(
        menuData.price
          ? new Intl.NumberFormat("id-ID").format(Number(menuData.price))
          : "",
      );
      setPhoto(menuData.photo);
      setPhotoBefore(menuData.photo);
      setIsAvailable(menuData.isAvailable);
      if (menuData.categoryId) {
        const cat = categories.find(
          (c: CategoryItem) => c.id === menuData.categoryId,
        );
        setSelectedCategory({
          value: Number(menuData.categoryId),
          label:
            cat?.name ||
            menuData.categoryName ||
            `Category #${menuData.categoryId}`,
        });
      }
      setIsInitialized(true);
    }
  }, [menuData, categories, isInitialized]);

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
    if (!id) return;
    try {
      await updateMenu({
        id: menuId,
        name,
        description,
        price: Number(String(price).replace(/\./g, "")),
        categoryId: selectedCategory?.value
          ? Number(selectedCategory.value)
          : undefined,
        photo,
        photoBefore,
        isAvailable,
      });
      navigate("/dashboard/manage-catalog");
    } catch {
      // Validation errors are handled via updateError or globally
    }
  };

  const errors = (updateError as unknown as Record<string, string>) || {};

  if (queryLoading && !menuData) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={400} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit Catalog Item #${id}`}
        subtitle="Modify product information, pricing, tasting notes, and image."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Catalog", to: "/dashboard/manage-catalog" },
          { label: `Edit Item #${id}` },
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Price (IDR)"
              type="text"
              value={price}
              onChange={handlePriceChange}
              error={errors.price}
              required
            />
          </div>

          <Dropdown
            label="Assign Category"
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
          />

          <div className="pt-2">
            <Checkbox
              label="Item is Available in kitchen inventory"
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
            <Button type="submit" variant="primary" loading={updateLoading}>
              Save Changes
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

export default EditCatalogPage;
