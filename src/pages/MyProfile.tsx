// src/pages/MyProfile.tsx
import HeaderDashboard from "../component/HeaderDashboard.tsx";
import DummyProfile from "../assets/images/dummyProfile.png"
import {useEffect, useRef, useState} from "react";
import Input from "../component/ui/form/Input.tsx";
import useProfile from "../hook/useProfile.ts";
import useAuthContext from "../hook/useAuthContext.ts";
import useNotificationContext from "../hook/useNotificationContext.ts";

const MyProfilePage = () => {
    const [formData, setFormData] = useState<{
        fullName: string;
        photo: File | string | null;
        preview: string;
        email: string;
        photoBefore?: string;
    }>({
        fullName: '',
        photo: null,
        preview: DummyProfile,
        email: '',
        photoBefore: ''
    });

    const {getProfile, updateProfile} = useProfile();
    const auth = useAuthContext();
    const notification = useNotificationContext();

    useEffect(() => {
        const fetchProfileData = async () => {
            const res = await getProfile();
            if (!res) return;
            const profileData = {
                fullName: res.fullName || '',
                photo: null as File | null,
                email: res.email || '',
                photoBefore: res.photo || '',
                preview: res.photo || DummyProfile
            };
            setFormData(prev => ({...prev, ...profileData}));
        };
        fetchProfileData();
    }, []);

    const inputFileRef = useRef<HTMLInputElement>(null);

    const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const file = files ? files[0] : null;
        if (file) {
            if (!file.type.startsWith('image/')) {
                notification.errorNotificationDashboard('Please upload an image file.', 'md');
                return;
            }
            const reader = new FileReader();
            reader.onload = (result) => {
                if (result.target && result.target.result) {
                    setFormData(prevState => ({
                        ...prevState,
                        photo: file,
                        preview: result.target!.result as string,
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name === 'fullName' || name === 'email') {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handleSave = async () => {
        await updateProfile(formData);
        const res = await getProfile();
        if (res) {
            auth.setAuthData({
                email: res.email,
                name: res.fullName,
                photo: res.photo,
                role: res.role,
            });
        }
    };

    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'My Account'} description={''}/>
            <div
                className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg border border-slate-100 dark:border-slate-700'}>
                <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                    Profile
                </h4>
                <div className={'gap-20 flex flex-col md:flex-row mt-14 mx-7 items-center'}>
                    <div>
                        <img
                            src={formData.preview || DummyProfile}
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DummyProfile;
                            }}
                            className={'sm:w-60 w-44 rounded-full sm:h-60 h-44 object-cover bg-gray-100 dark:bg-slate-700'}
                            alt={'Profile'}
                        />
                        <button onClick={() => {
                            if (!inputFileRef.current) return;
                            inputFileRef.current.click();
                        }}
                                className={'btn-primary px-5 py-3 rounded-2xl block mx-auto mt-8 text-white'}>
                            Upload Photo
                        </button>
                        <input
                            type="file"
                            id="file"
                            ref={inputFileRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleChangeFile}
                        />
                    </div>
                    <div className={'grow space-y-14'}>
                        <Input disabled={false} required={false} value={formData.fullName} onChange={handleChange}
                               name={'fullName'}
                               label={"Full Name"} type={'text'} placeholder={'Type Full Name'}/>
                        <Input placeholder={'Email'} type={'email'} disabled={true} required={false}
                               value={formData.email} label={'Email'} name={'email'}/>
                    </div>
                </div>
                <div className={'flex justify-center md:justify-end mt-10'}>
                    <button onClick={handleSave}
                            className={'btn-primary text-white px-10 font-semibold py-3 rounded-2xl'}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyProfilePage;