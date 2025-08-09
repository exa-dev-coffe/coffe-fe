import HeaderDashboard from "../component/HeaderDashboard.tsx";
import DummyProfile from "../assets/images/dummyProfile.png"
import {useRef, useState} from "react";
import Input from "../component/ui/form/Input.tsx";

const MyProfilePage = () => {

    const [formData, setFormData] = useState({
        full_name: '',
        photo: '',
        email: '',
    })

    const inputFileRef = useRef<HTMLInputElement>(null);

    const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const file = files ? files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (result) => {
                if (!result.target) return;
                console.log(result.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'My Account'} description={''}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <h4 className={'text-xl font-semibold'}>
                    Profile
                </h4>
                <div className={'gap-20 flex mt-14 mx-7 items-center'}>
                    <div>
                        <img src={DummyProfile} className={'w-60'} alt={'Profile'}/>
                        <button onClick={() => {
                            if (!inputFileRef.current) return
                            inputFileRef.current.click()
                        }}
                                className={'btn-primary px-5 py-3 rounded-2xl block mx-auto  mt-8 text-white'}>
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
                        <Input disabled={false} required={false} value={formData.full_name} onChange={handleChange}
                               name={'full_name'}
                               label={"Full Name"} type={'text'} placeholder={'Type Full Name'}/>
                        <Input placeholder={'Email'} type={'email'} disabled={true} required={false}
                               value={formData.email} label={'Email'} name={'email'}/>
                    </div>
                </div>
                <div className={'flex justify-end mt-10'}>
                    <button className={'btn-primary text-white px-10 font-semibold py-3 rounded-2xl'}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyProfilePage;