import React from "react";
import {Link} from "react-router";
import Button from "@/components/ui/Button.tsx";
import BgHome from "@/assets/images/bgHome.webp";
import {HiOutlineArrowRight, HiOutlineSparkles} from "react-icons/hi";

export const HeroBanner: React.FC = () => {
    return (
        <section
            className="relative rounded-3xl overflow-hidden bg-cover bg-center min-h-[480px] sm:min-h-[540px] flex items-center shadow-xl"
            style={{backgroundImage: `url(${BgHome})`}}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent backdrop-blur-xs" />

            <div className="relative z-10 p-8 sm:p-14 max-w-2xl space-y-6 animate-fade-in text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <HiOutlineSparkles className="text-amber-400 text-sm" />
                    Specialty Coffee Experience
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                    Where Every Cup Tells a <span className="text-amber-400 underline decoration-amber-500/50 decoration-wavy decoration-2">Story</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                    Immerse yourself in freshly roasted single-origin espresso, delicate pour-overs, and delicious artisan bakery right from your table.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link to="/menu">
                        <Button
                            variant="primary"
                            size="lg"
                            rightIcon={<HiOutlineArrowRight />}
                            className="shadow-lg shadow-amber-500/20"
                        >
                            Explore Menu
                        </Button>
                    </Link>
                    <Link to="/my-wallet">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                        >
                            Digital Wallet
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
