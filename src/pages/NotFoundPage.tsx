import React from "react";
import {Link} from "react-router";
import Button from "@/components/ui/Button.tsx";
import IconLogo from "@/assets/images/icon.png";
import {HiOutlineHome, HiOutlineSearch} from "react-icons/hi";

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center animate-fade-in">
            <div className="max-w-md space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/15 p-3 mx-auto flex items-center justify-center border border-amber-500/30">
                    <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                </div>

                <div className="space-y-2">
                    <span className="text-6xl sm:text-7xl font-black text-amber-600 dark:text-amber-400 tracking-tighter">
                        404
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        Page Not Found
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        The coffee roast or page you're searching for seems to have moved or does not exist.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <Link to="/">
                        <Button variant="primary" size="md" leftIcon={<HiOutlineHome />}>
                            Return Home
                        </Button>
                    </Link>
                    <Link to="/menu">
                        <Button variant="secondary" size="md" leftIcon={<HiOutlineSearch />}>
                            Browse Menu
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
