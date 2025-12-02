import BgLogin from '../../assets/images/bgLogin.webp';
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {MdOutlineLock} from "react-icons/md";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import useAuth from "../../hook/useAuth.ts";

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const {error, changePassword} = useAuth();
    const navigate = useNavigate();
    const notification = useNotificationContext();

    // read token from url
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const t = urlParams.get('token');
        if (!t) {
            notification.errorNotificationClient('Reset token is missing. Please request a new link.', 'md');
            navigate('/forget-password', {replace: true});
        } else {
            setToken(t);
        }

    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) {
            notification.errorNotificationClient('Reset token is missing. Please request a new link.', 'md');
            return navigate('/forget-password', {replace: true});
        }
        await changePassword({password, confirmPassword, token});
    }

    return (
        <div className="grid lg:grid-cols-2 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-center p-4 sm:p-16">
                <div className="bg-white dark:bg-gray-800 xl:mt-24 mt-14 px-5 sm:px-10 py-8 w-full rounded-4xl">
                    <h1 className="sm:text-2xl text-lg font-bold text-black md:text-4xl dark:text-white">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-500 mt-2 dark:text-gray-400">
                        Enter your new password below. Make sure it's at least 6 characters.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                        <InputIcon
                            icon={<MdOutlineLock/>}
                            label="New Password"
                            type={'password'}
                            required={true}
                            disabled={false}
                            value={password}
                            error={error.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            placeholder="Type your new password"
                            name="password"
                        />

                        <InputIcon
                            icon={<MdOutlineLock/>}
                            label="Confirm Password"
                            type={'password'}
                            required={true}
                            disabled={false}
                            value={confirmPassword}
                            error={error.confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            placeholder="Retype your new password"
                            name="confirmPassword"
                        />
                        <button
                            type="submit"
                            className="px-5 mt-4 py-3 btn-primary text-white w-full rounded-2xl font-bold disabled:opacity-50"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:block hidden">
                <img className="absolute h-screen w-1/2 top-0" src={BgLogin} alt="Reset Password Image"/>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

