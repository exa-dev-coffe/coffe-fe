import React, {useState} from "react";
import {Link} from "react-router";
import useAuth from "@/features/auth/hooks/useAuth.ts";
import Card from "@/components/ui/Card.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton.tsx";
import BgRegis from "@/assets/images/bgRegis.webp";
import IconLogo from "@/assets/images/icon.png";
import {HiOutlineMail, HiOutlineLockClosed, HiOutlineUser} from "react-icons/hi";

export const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const {register, googleLoginRedirect, loading, errors} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(formData);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative py-12"
            style={{backgroundImage: `url(${BgRegis})`}}
        >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

            <Card variant="auth" className="relative z-10 animate-fade-in">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 p-2 flex items-center justify-center border border-amber-500/30 shadow-md">
                            <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Create Account
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Join Diskusi Coffee Club for exclusive perks & digital wallet
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputIcon
                        label="Full Name"
                        type="text"
                        name="fullName"
                        icon={<HiOutlineUser />}
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        error={errors.fullName}
                        required
                    />

                    <InputIcon
                        label="Email Address"
                        type="email"
                        name="email"
                        icon={<HiOutlineMail />}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        error={errors.email}
                        required
                    />

                    <InputIcon
                        label="Password"
                        type="password"
                        name="password"
                        icon={<HiOutlineLockClosed />}
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        error={errors.password}
                        required
                    />

                    <InputIcon
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        icon={<HiOutlineLockClosed />}
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        error={errors.confirmPassword}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        className="mt-4"
                    >
                        Create Account
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
                            Or register with
                        </span>
                    </div>
                </div>

                <GoogleSignInButton
                    onClick={googleLoginRedirect}
                    loading={loading}
                    label="Sign up with Google"
                />

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                        Sign in instead
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;
