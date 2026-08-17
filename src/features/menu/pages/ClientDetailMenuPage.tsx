import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useMenuDetailQuery } from "@/features/menu/hooks/useMenu.ts";
import { useMenusByCategoryQuery } from "@/features/categories/hooks/useCategory.ts";
import { useCartContext } from "@/app/providers/CartContext.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Rating from "@/components/ui/Rating.tsx";
import Textarea from "@/components/ui/Textarea.tsx";
import Badge from "@/components/ui/Badge.tsx";
import MenuCard from "@/features/menu/components/MenuCard.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {
  HiOutlineShoppingCart,
  HiOutlineArrowLeft,
  HiMinus,
  HiPlus,
  HiSparkles,
} from "react-icons/hi";
import type { MenuItem } from "../types/menu.types";

export const ClientDetailMenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const menuId = Number(id);

  const { data: menu, isLoading: loading } = useMenuDetailQuery(menuId);

  // Fetch suggestions based on current menu's category
  const { data: menuByCategory = [] } = useMenusByCategoryQuery(
    menu?.categoryId ?? undefined,
  );

  const { cart, setDatas } = useCartContext();
  const { auth } = useAuthContext();
  const { successNotificationClient, errorNotificationClient } =
    useNotificationContext();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    setQuantity(1);
    setNotes("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleAddToCart = () => {
    if (!auth.isAuth) {
      errorNotificationClient("Please sign in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!menu) return;
    if (!menu.isAvailable) {
      errorNotificationClient("Sorry, this item is currently out of stock.");
      return;
    }

    const existingIndex = cart.datas.findIndex((item) => item.id === menu.id);
    const updatedDatas = [...cart.datas];

    if (existingIndex > -1) {
      updatedDatas[existingIndex] = {
        ...updatedDatas[existingIndex],
        amount: updatedDatas[existingIndex].amount + quantity,
        notes: notes || updatedDatas[existingIndex].notes,
      };
    } else {
      updatedDatas.push({
        id: menu.id,
        nameProduct: menu.name,
        price: menu.price,
        photo: menu.photo,
        amount: quantity,
        checked: true,
        notes,
      });
    }

    setDatas(updatedDatas);
    successNotificationClient(
      `Added ${quantity}x "${menu.name}" to your cart!`,
    );
  };

  if (loading && !menu) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton variant="rounded" height={400} />
          <div className="space-y-4">
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rounded" height={50} />
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Menu item not found</h2>
        <Link to="/menu">
          <Button variant="primary">Return to Menu</Button>
        </Link>
      </div>
    );
  }

  const suggestions = menuByCategory
    .filter((item: MenuItem) => item.id !== menu.id)
    .slice(0, 4);

  return (
    <div className="py-10 space-y-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
          >
            <HiOutlineArrowLeft /> Back to Catalog
          </Link>
        </div>

        {/* Main Product Showcase Card */}
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Showcase */}
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={menu.photo || DummyProduct}
                alt={menu.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DummyProduct;
                }}
                className="w-full h-full object-cover"
              />
              {!menu.isAvailable && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                  <Badge variant="danger" size="md">
                    Sold Out / Unavailable
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Detail Info & Order Stepper */}
            <div className="p-6 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={menu.isAvailable ? "success" : "danger"} dot>
                    {menu.isAvailable ? "Available in Kitchen" : "Out of Stock"}
                  </Badge>

                  {menu.rating !== undefined && menu.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Rating rating={menu.rating} size="sm" showNumber />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {menu.name}
                  </h1>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                    {formatCurrency(menu.price)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Product Story & Notes
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {menu.description ||
                      "Carefully crafted by our master roasters and baristas to bring out rich aromatic flavor notes."}
                  </p>
                </div>

                {/* Custom Notes for Barista */}
                <div className="pt-2">
                  <Textarea
                    label="Special Instructions / Notes"
                    placeholder="e.g. Less sugar, extra oat milk, less ice..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!menu.isAvailable}
                  />
                </div>
              </div>

              {/* Quantity Selector & Add to Cart Button */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quantity
                  </span>
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={quantity <= 1 || !menu.isAvailable}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm disabled:opacity-40 transition-all cursor-pointer hover:scale-105"
                    >
                      <HiMinus className="text-xs" />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-slate-900 dark:text-slate-100">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!menu.isAvailable}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm disabled:opacity-40 transition-all cursor-pointer hover:scale-105"
                    >
                      <HiPlus className="text-xs" />
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!menu.isAvailable}
                  leftIcon={<HiOutlineShoppingCart className="text-xl" />}
                  onClick={handleAddToCart}
                >
                  Add to Cart • {formatCurrency(menu.price * quantity)}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Suggestions Carousel / Grid */}
      {suggestions.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-2">
            <HiSparkles className="text-amber-500 text-xl" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              You Might Also Enjoy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggestions.map((item: MenuItem) => (
              <MenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                photo={item.photo}
                rating={item.rating}
                isAvailable={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailMenuPage;
