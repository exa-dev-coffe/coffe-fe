import React from "react";
import {Link} from "react-router";
import Button from "@/components/ui/Button.tsx";
import {HiOutlineShieldExclamation, HiOutlineHome} from "react-icons/hi";

export const ForbiddenPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-center animate-fade-in">
            <div className="max-w-md space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/15 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-4xl border border-rose-500/30">
                    <HiOutlineShieldExclamation />
                </div>

                <div className="space-y-2">
                    <span className="text-6xl sm:text-7xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">
                        403
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                        Access Restricted
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        You do not have the required administrative or barista credentials to access this area.
                    </p>
                </div>

                <div className="pt-2">
                    <Link to="/">
                        <Button variant="primary" size="md" leftIcon={<HiOutlineHome />}>
                            Return to Storefront
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForbiddenPage;
