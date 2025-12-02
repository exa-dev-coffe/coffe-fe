import BgLogin from '../../assets/images/bgLogin.webp';
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {TfiEmail} from "react-icons/tfi";
import {useState} from "react";
import {Link} from "react-router";
import useAuth from "../../hook/useAuth.ts";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const {error, forgetPassword} = useAuth();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        forgetPassword({email});
    };

    return (
        <div className="grid lg:grid-cols-2 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center justify-center p-4 sm:p-16">
                <div className="bg-white dark:bg-gray-800 xl:mt-24 mt-14 px-5 sm:px-10 py-8 w-full rounded-4xl">
                    <h1 className="sm:text-2xl text-lg font-bold text-black md:text-4xl dark:text-white">
                        Forgot Your Password?
                    </h1>
                    <p className="text-gray-500 mt-2 dark:text-gray-400">
                        Enter your email and we’ll send you a reset link.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                        <InputIcon
                            icon={<TfiEmail/>}
                            label="Email Address"
                            type="email"
                            required={true}
                            disabled={false}
                            value={email}
                            error={error.email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Type your valid email"
                            name="email"
                        />

                        <button
                            type="submit"
                            className="px-5 mt-10 py-3 btn-primary text-white w-full rounded-2xl font-bold"
                        >
                            Send Reset Link
                        </button>

                        <div className="text-center mt-5">
                            <Link
                                to="/login"
                                className="text-blue-500 dark:text-blue-300 hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:block hidden">
                <img className="absolute h-screen w-1/2 top-0" src={BgLogin} alt="Forgot Password Image"/>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;