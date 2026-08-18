import React from "react";
import { BiCoffee } from "react-icons/bi";
import { SUPPORTED_ICONS, type IconName } from "@/core/constants/iconRegistry.ts";

interface DynamicIconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className,
}) => {
  if (!name || !(name in SUPPORTED_ICONS)) {
    return <BiCoffee className={className} />;
  }

  const IconComponent = SUPPORTED_ICONS[name as IconName];
  return <IconComponent className={className} />;
};

export default DynamicIcon;
