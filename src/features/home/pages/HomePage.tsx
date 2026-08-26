import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import HeroBanner from "@/features/home/components/HeroBanner.tsx";
import TablePickerModal from "@/features/home/components/TablePickerModal.tsx";
import MenuCard from "@/features/menu/components/MenuCard.tsx";
import { useMenusQuery } from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import { useCartContext } from "@/app/providers/CartContext.ts";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import { CardSkeleton } from "@/components/ui/Skeleton.tsx";
import {
  HiOutlineDesktopComputer,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineLocationMarker,
  HiOutlineHeart,
} from "react-icons/hi";
import DynamicIcon from "@/components/ui/DynamicIcon.tsx";
import type { CategoryItem } from "@/features/categories/types/category.types";
import type { MenuItem } from "@/features/menu/types/menu.types";

export const HomePage: React.FC = () => {
  const { cart } = useCartContext();
  const { data: menuData, isLoading: loading } = useMenusQuery(1, 8);
  const { data: categories = [] } = useCategoryOptionsQuery();
  const [showTableModal, setShowTableModal] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Auto prompt table selection if table is unassigned
    if (cart.tableId === 0) {
      const timer = setTimeout(() => {
        setShowTableModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cart.tableId]);

  const menus = menuData?.data || [];
  const featuredMenus = menus;

  return (
    <div className="py-8 sm:py-12 space-y-16">
      <div className="container mx-auto px-4 sm:px-6 space-y-12">
        {/* Hero Section */}
        <HeroBanner />

        {/* Table & Dine-in Status Banner */}
        <Card
          variant="glass"
          className="p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
                <HiOutlineDesktopComputer />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Seating Table
                  </h3>
                  {cart.tableId > 0 ? (
                    <Badge variant="success" size="sm" dot>
                      Table #{cart.tableName}
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Not Selected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {cart.tableId > 0
                    ? `Ordering for: "${cart.orderFor || "Guest"}". Baristas will deliver directly to this table.`
                    : "Select your table number so our baristas know where to serve your order."}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowTableModal(true)}
              className="shrink-0"
            >
              {cart.tableId > 0 ? "Change Table" : "Select Table"}
            </Button>
          </div>
        </Card>

        {/* Categories Highlight */}
        {categories.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Categories
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Browse by Roast & Taste
                </h2>
              </div>
              <Link
                to="/menu"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                View All <HiOutlineArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat: CategoryItem) => (
                <Link
                  key={cat.id}
                  to={`/menu?category=${cat.id}`}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all hover:scale-105 shadow-sm text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                    {cat.icon ? <DynamicIcon name={cat.icon} /> : <HiOutlineSparkles />}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {cat.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Signature Menu */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Curated Selection
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Signature Creations
              </h2>
            </div>
            <Link to="/menu">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<HiOutlineArrowRight />}
              >
                Full Menu
              </Button>
            </Link>
          </div>

          {loading && menus.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredMenus.map((item: MenuItem) => (
                <MenuCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  effectivePrice={item.effectivePrice}
                  discount={item.discount}
                  photo={item.photo}
                  rating={item.rating}
                  isAvailable={item.isAvailable}
                />
              ))}
            </div>
          )}
        </div>

        {/* Features & Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Card variant="glass" className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
              <HiOutlineCreditCard />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Integrated Digital Wallet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Top up seamlessly via Midtrans Core API and enjoy contactless 1-click
              checkout with a secure PIN.
            </p>

          </Card>

          <Card variant="glass" className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
              <HiOutlineHeart />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Single Origin Roasts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ethically sourced beans roasted in small batches to highlight
              distinct origin characteristics and aroma.
            </p>
          </Card>

          <Card variant="glass" className="p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
              <HiOutlineLocationMarker />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Multiple Store Outlets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Visit our flagship roasteries across Jakarta and Tangerang for a
              calm, aesthetic workspace and cafe vibe.
            </p>
          </Card>
        </div>
      </div>

      {/* Table Picker Dialog */}
      <TablePickerModal
        show={showTableModal}
        onClose={() => setShowTableModal(false)}
      />
    </div>
  );
};

export default HomePage;
