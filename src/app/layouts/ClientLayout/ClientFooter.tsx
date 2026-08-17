import React from "react";
import {Link} from "react-router";
import IconLogo from "@/assets/images/icon.png";
import GrabFoodLogo from "@/assets/images/logoGrabFood.png";
import AstroKitchenLogo from "@/assets/images/logoAstroKicthen.png";
import ShopeeFoodLogo from "@/assets/images/logoShopeeFood.png";
import {HiLocationMarker, HiPhone, HiMail} from "react-icons/hi";

export const ClientFooter: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
            <div className="container mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Column 1: Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 p-1.5 flex items-center justify-center border border-amber-500/30">
                                <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                DISKUSI <span className="text-amber-400">COFFEE</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Crafting artisanal coffee experiences with single-origin beans roasted to perfection. Elevate your everyday coffee ritual.
                        </p>
                    </div>

                    {/* Column 2: Flagship Address */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Flagship Store
                        </h4>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p className="flex items-start gap-2">
                                <HiLocationMarker className="text-amber-500 text-base shrink-0 mt-0.5" />
                                <span>Jl. Pal Merah Utara II No.24, Palmerah, Jakarta Barat 11480</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <HiPhone className="text-amber-500 text-base shrink-0" />
                                <span>+62 21 555 3421</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <HiMail className="text-amber-500 text-base shrink-0" />
                                <span>hello@diskusicoffee.id</span>
                            </p>
                        </div>
                    </div>

                    {/* Column 3: Quick Navigation */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Explore
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <Link to="/menu" className="hover:text-amber-400 transition-colors">
                                    Our Menu & Roasts
                                </Link>
                            </li>
                            <li>
                                <Link to="/location" className="hover:text-amber-400 transition-colors">
                                    Store Locations
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-wallet" className="hover:text-amber-400 transition-colors">
                                    Digital Member Wallet
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-transaction" className="hover:text-amber-400 transition-colors">
                                    Order History & Ratings
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Online Partners */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                            Delivery Partners
                        </h4>
                        <p className="text-xs text-slate-400">
                            Order directly from our certified online delivery partners.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-colors">
                                <img src={GrabFoodLogo} alt="Grab Food" className="h-7 w-auto object-contain" />
                            </div>
                            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-colors">
                                <img src={AstroKitchenLogo} alt="Astro Kitchen" className="h-7 w-auto object-contain" />
                            </div>
                            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-colors">
                                <img src={ShopeeFoodLogo} alt="Shopee Food" className="h-7 w-auto object-contain" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Diskusi Coffee Roastery. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
                        <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
                        <span className="hover:text-slate-400 transition-colors">Cookie Settings</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ClientFooter;
