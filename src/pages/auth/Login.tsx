import BgLogin from '../../assets/images/bgLogin.webp';
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {TfiEmail} from "react-icons/tfi";
import {MdOutlineLock} from "react-icons/md";
import {useState} from "react";
import useAuth from "../../hook/useAuth.ts";
import {Link} from "react-router";
import ButtonSignInGoogle from "../../component/ButtonSignInGoogle.tsx";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const {login, error} = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div className="grid lg:grid-cols-2 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-center p-4 sm:p-16">
                <div className="bg-white dark:bg-gray-800 xl:mt-24 mt-14 px-5 sm:px-10 py-8 w-full rounded-4xl">
                    <h1 className="sm:text-2xl text-lg font-bold text-black md:text-4xl dark:text-white">
                        Welcome Back,
                        <br/>
                        Login to your Account
                    </h1>
                    <p className="text-gray-500 mt-2 dark:text-gray-400">
                        Don’t have an account?{" "}
                        <Link to="/register" className="text-blue-500 dark:text-blue-300">
                            Sign Up Free!
                        </Link>
                    </p>
                    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                        <InputIcon
                            icon={<TfiEmail/>}
                            label="Email Address"
                            type="email"
                            required={true}
                            disabled={false}
                            value={formData.email}
                            error={error.email}
                            onChange={handleChange}
                            placeholder="Type your valid email"
                            name="email"
                        />
                        <InputIcon
                            icon={<MdOutlineLock/>}
                            label="Password"
                            type="password"
                            error={error.password}
                            required={true}
                            disabled={false}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Type your password"
                            name="password"
                        />
                        <button
                            type="submit"
                            className="px-5 mt-10 py-3 btn-primary text-white w-full rounded-2xl font-bold"
                        >
                            Login to My Account
                        </button>
                        <ButtonSignInGoogle/>
                    </form>
                </div>
            </div>
            <div className="lg:block hidden">
                <img className="absolute h-screen w-1/2 top-0" src={BgLogin} alt="Register Image"/>
            </div>
        </div>
    );
};

export default LoginPage;
