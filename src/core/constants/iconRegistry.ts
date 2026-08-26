import {
  BiCoffee,
  BiCoffeeTogo,
  BiCake,
  BiCookie,
  BiDrink,
  BiDish,
  BiLeaf,
  BiStore,
  BiGift,
  BiPurchaseTag,
  BiStar,
  BiHeart,
} from "react-icons/bi";

export const SUPPORTED_ICONS = {
  BiCoffee,
  BiCoffeeTogo,
  BiCake,
  BiCookie,
  BiDrink,
  BiDish,
  BiLeaf,
  BiStore,
  BiGift,
  BiPurchaseTag,
  BiStar,
  BiHeart,
};

export type IconName = keyof typeof SUPPORTED_ICONS;

export const ICON_NAMES = Object.keys(SUPPORTED_ICONS) as IconName[];
