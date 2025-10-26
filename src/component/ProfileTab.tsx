import DummyProfile from "../assets/images/dummyProfile.png";
import ButtonTabProfile from "./ButtonTabProfile.tsx";
import {useEffect, useRef, useState} from "react";

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
    }
}

const ProfileTab: React.FC<ProfileTab> = ({dataTabProfileUser, user: {name, role}}) => {

    const [openTabProfile, setOpenTabProfile] = useState(false);
    const tabProfileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const tabProfileElement = tabProfileRef.current;
            if (openTabProfile && tabProfileElement && !tabProfileElement.contains(event.target as Node) && window.innerWidth < 640) {
                setOpenTabProfile(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    useEffect(() => {
        let fadeTimeOut: number | NodeJS.Timeout;
        if (openTabProfile) {
            if (tabProfileRef.current) {
                tabProfileRef.current.classList.remove('hidden', 'animate-fade-out');
                tabProfileRef.current.classList.add('animate-fade-in');
            }
        } else {
            if (tabProfileRef.current) {
                tabProfileRef.current.classList.remove('animate-fade-in');
                tabProfileRef.current.classList.add('animate-fade-out');
                fadeTimeOut = setTimeout(() => {
                    if (tabProfileRef.current) {
                        tabProfileRef.current.classList.add('hidden');
                        tabProfileRef.current.classList.remove('animate-fade-out');
                    }
                }, 300); // Match the duration of the transition
            }
        }

        return () => {
            if (fadeTimeOut) {
                clearTimeout(fadeTimeOut);
            }
        };
    }, [openTabProfile]);

    return (
        <div className={'relative w-40'}
             onClick={(e) => {
                 e.stopPropagation();
                 setOpenTabProfile(!openTabProfile)
             }}
             onMouseEnter={() => setOpenTabProfile(true)} onMouseLeave={() => setOpenTabProfile(false)}
        >
            <div className={'flex items-center gap-8'}>
                <div className={'text-end'}>
                    <h4 className={'font-bold text-lg sm:text-2xl'}>{name}</h4>
                    <p className={'text-secondary text-xs sm:text-sm'}>{role}</p>
                </div>
                <img src={DummyProfile} className={'w-14 h-14'} alt={'profile'}/>
            </div>
            <div
                ref={tabProfileRef}  // Use the ref to manage visibility
                className={`absolute w-full me-10 pt-7 bg-white rounded-lg shadow-md transition-all duration-300 z-50 hidden`}>
                {
                    dataTabProfileUser.map((item, index) => (
                        <ButtonTabProfile key={index} to={item.to} icon={item.icon}
                                          onClick={item.onClick}
                                          title={item.title}/>
                    ))
                }
            </div>
        </div>
    )
}

export default ProfileTab;