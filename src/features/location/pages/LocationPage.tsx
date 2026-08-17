import React, {useState} from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlineClock,
    HiOutlineExternalLink,
} from "react-icons/hi";

interface StoreLocation {
    id: number;
    name: string;
    city: string;
    address: string;
    phone: string;
    hours: string;
    googleMapsUrl: string;
    isFlagship?: boolean;
}

const STORE_LOCATIONS: StoreLocation[] = [
    {
        id: 1,
        name: "Diskusi Coffee Palmerah Flagship",
        city: "Jakarta Barat",
        address: "Jl. Pal Merah Utara II No.24, RT.1/RW.2, Palmerah, Kec. Palmerah, Jakarta Barat 11480",
        phone: "+62 21 555 3421",
        hours: "07:00 AM - 10:00 PM Daily",
        googleMapsUrl: "https://maps.google.com/?q=Palmerah+Jakarta",
        isFlagship: true,
    },
    {
        id: 2,
        name: "Diskusi Coffee Senopati Roastery",
        city: "Jakarta Selatan",
        address: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190",
        phone: "+62 21 555 8890",
        hours: "08:00 AM - 11:00 PM Daily",
        googleMapsUrl: "https://maps.google.com/?q=Senopati+Jakarta",
    },
    {
        id: 3,
        name: "Diskusi Coffee BSD Artisan Corner",
        city: "Tangerang",
        address: "The Breeze BSD City, Unit L-12, Grand Boulevard, Tangerang 15345",
        phone: "+62 21 555 1209",
        hours: "08:00 AM - 10:00 PM Daily",
        googleMapsUrl: "https://maps.google.com/?q=BSD+City+Tangerang",
    },
    {
        id: 4,
        name: "Diskusi Coffee PIK 2 Waterfront",
        city: "Jakarta Utara",
        address: "Pantai Maju PIK, Golf Island Promenade No. 8, Jakarta Utara 14470",
        phone: "+62 21 555 7765",
        hours: "07:00 AM - 11:00 PM Daily",
        googleMapsUrl: "https://maps.google.com/?q=PIK+Jakarta",
    },
];

export const LocationPage: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<string>("All");

    const cities = ["All", "Jakarta Barat", "Jakarta Selatan", "Jakarta Utara", "Tangerang"];

    const filteredLocations =
        selectedCity === "All"
            ? STORE_LOCATIONS
            : STORE_LOCATIONS.filter((loc) => loc.city === selectedCity);

    return (
        <div className="py-10">
            <div className="container mx-auto px-4 sm:px-6 space-y-10 max-w-6xl">
                <PageHeader
                    title="Our Store Outlets"
                    subtitle="Find your nearest Diskusi Coffee Roastery for dine-in, specialty beans, or cozy workspace."
                    breadcrumb={[
                        {label: "Home", to: "/"},
                        {label: "Locations"},
                    ]}
                />

                {/* City Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {cities.map((city) => {
                        const isSelected = selectedCity === city;
                        return (
                            <button
                                key={city}
                                type="button"
                                onClick={() => setSelectedCity(city)}
                                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm ${
                                    isSelected
                                        ? "bg-amber-600 text-white shadow-amber-500/20 scale-105"
                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                                }`}
                            >
                                {city}
                            </button>
                        );
                    })}
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLocations.map((loc) => (
                        <Card
                            key={loc.id}
                            variant="interactive"
                            className="p-6 sm:p-8 flex flex-col justify-between space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                                {loc.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                            {loc.city}
                                        </span>
                                    </div>
                                    {loc.isFlagship && (
                                        <Badge variant="primary" size="sm">
                                            Flagship Store
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                    <p className="flex items-start gap-2.5">
                                        <HiOutlineLocationMarker className="text-amber-500 text-base shrink-0 mt-0.5" />
                                        <span>{loc.address}</span>
                                    </p>
                                    <p className="flex items-center gap-2.5">
                                        <HiOutlinePhone className="text-amber-500 text-base shrink-0" />
                                        <span>{loc.phone}</span>
                                    </p>
                                    <p className="flex items-center gap-2.5">
                                        <HiOutlineClock className="text-amber-500 text-base shrink-0" />
                                        <span>{loc.hours}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <a
                                    href={loc.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <Button
                                        variant="outline"
                                        size="md"
                                        fullWidth
                                        rightIcon={<HiOutlineExternalLink />}
                                    >
                                        Open in Google Maps
                                    </Button>
                                </a>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationPage;
