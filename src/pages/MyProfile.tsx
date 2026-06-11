import HeaderDashboard from "../component/HeaderDashboard.tsx";
import DummyProfile from "../assets/images/dummyProfile.png"
import {useEffect, useRef, useState} from "react";
import Input from "../component/ui/form/Input.tsx";
import useProfile from "../hook/useProfile.ts";
import useAuthContext from "../hook/useAuthContext.ts";
import useNotificationContext from "../hook/useNotificationContext.ts";
import Card from "../component/ui/Card.tsx";

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
    const [saving, setSaving] = useState(false);

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
                notification.errorNotificationDashboard('Please upload an image file.');
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
        setSaving(true);
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
        setSaving(false);
    };

    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'My Account'} description={''}/>
            <Card variant="dashboard" className="mt-10">
                <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                    Profile
                </h4>
                <div className={'gap-20 flex flex-col md:flex-row mt-14 md:mx-7 items-center'}>
                    <div className="text-center">
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
                                className={'btn-primary px-5 py-3 rounded-2xl block mx-auto mt-6 text-white'}>
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
                    <div className={'grow space-y-8 w-full'}>
                        <Input disabled={false} required={false} value={formData.fullName} onChange={handleChange}
                               name={'fullName'}
                               label={"Full Name"} type={'text'} placeholder={'Type Full Name'}/>
                        <Input placeholder={'Email'} type={'email'} disabled={true} required={false}
                               value={formData.email} label={'Email'} name={'email'}/>
                    </div>
                </div>
                <div className={'flex justify-center md:justify-end mt-10'}>
                    <button onClick={handleSave} disabled={saving}
                            className={`btn-primary text-white px-10 font-semibold py-3 rounded-2xl ${saving ? 'btn-loading' : ''}`}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default MyProfilePage;