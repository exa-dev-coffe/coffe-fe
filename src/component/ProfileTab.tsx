import DummyProfile from "../assets/images/dummyProfile.png";
import ButtonTabProfile from "./ButtonTabProfile.tsx";
import { useEffect, useRef, useState } from "react";

interface ProfileTab {
  dataTabProfileUser: {
    to?: string;
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
  }[];
  user: {
    name: string;
    role: string;
  };
}

const ProfileTab: React.FC<ProfileTab> = ({ dataTabProfileUser, user: { name, role } }) => {
  const [openTabProfile, setOpenTabProfile] = useState(false);
  const tabProfileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const tabProfileElement = tabProfileRef.current;
      if (openTabProfile && tabProfileElement && !tabProfileElement.contains(event.target as Node) && window.innerWidth < 640) {
        setOpenTabProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let fadeTimeOut: number;
    if (openTabProfile) {
      if (tabProfileRef.current) {
        tabProfileRef.current.classList.remove("hidden", "animate-fade-out");
        tabProfileRef.current.classList.add("animate-fade-in");
      }
    } else {
      if (tabProfileRef.current) {
        tabProfileRef.current.classList.remove("animate-fade-in");
        tabProfileRef.current.classList.add("animate-fade-out");
        fadeTimeOut = setTimeout(() => {
          if (tabProfileRef.current) {
            tabProfileRef.current.classList.add("hidden");
            tabProfileRef.current.classList.remove("animate-fade-out");
          }
        }, 300);
      }
    }
    return () => {
      if (fadeTimeOut) clearTimeout(fadeTimeOut);
    };
  }, [openTabProfile]);

  return (
    <div
      className="relative sm:w-40 dark:text-gray-100"
      onClick={(e) => {
        e.stopPropagation();
        setOpenTabProfile(!openTabProfile);
      }}
      onMouseEnter={() => setOpenTabProfile(true)}
      onMouseLeave={() => setOpenTabProfile(false)}
    >
      <div className="flex items-center gap-2 sm:gap-8">
        <div className="text-end hidden sm:block">
          <h4 className="font-bold sm:text-2xl dark:text-gray-100 leading-tight">{name}</h4>
          <p className="text-secondary text-xs sm:text-sm dark:text-gray-300">{role}</p>
        </div>
        <img src={DummyProfile} className="w-10 h-10 sm:w-14 sm:h-14 dark:brightness-90 rounded-full object-cover" alt="profile" />
      </div>
      <div
        ref={tabProfileRef}
        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md transition-all duration-300 z-50 hidden dark:bg-gray-800 dark:shadow-none dark:border dark:border-gray-700 dark:text-gray-100"
      >
        {dataTabProfileUser.map((item, index) => (
          <ButtonTabProfile key={index} to={item.to} icon={item.icon} onClick={item.onClick} title={item.title} />
        ))}
      </div>
    </div>
  );
};

export default ProfileTab;
