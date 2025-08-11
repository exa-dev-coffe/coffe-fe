import DummyProfile from "../assets/images/dummyProfile.png";
import ButtonTabProfile from "./ButtonTabProfile.tsx";
import {useState} from "react";

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

    return (
        <div className={'relative'}
             onMouseEnter={() => setOpenTabProfile(true)} onMouseLeave={() => setOpenTabProfile(false)}
        >
            <div className={'flex items-center gap-8'}>
                <div className={'text-end'}>
                    <h4 className={'font-bold text-2xl'}>{name}</h4>
                    <p className={'text-secondary text-sm'}>{role}</p>
                </div>
                <img src={DummyProfile} className={'w-14 h-14'} alt={'profile'}/>
            </div>
            <div
                className={`absolute w-48 pt-7 bg-white rounded-lg shadow-md transition-all duration-300 z-50 ${openTabProfile ? 'opacity-100' : 'opacity-0'}`}>
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