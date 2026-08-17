import React, {useEffect, useState} from "react";
import {Link, useSearchParams} from "react-router";
import useAuth from "@/features/auth/hooks/useAuth.ts";
import Card from "@/components/ui/Card.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import GoogleSignInButton from "@/features/auth/components/GoogleSignInButton.tsx";
import BgLogin from "@/assets/images/bgLogin.webp";
import IconLogo from "@/assets/images/icon.png";
import {HiOutlineMail, HiOutlineLockClosed} from "react-icons/hi";

export const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({email: "", password: ""});
    const {login, googleLogin, googleLoginRedirect, loading, errors} = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tokenTemp = searchParams.get("token_temp");
        if (tokenTemp) {
            googleLogin(tokenTemp);
        }
    }, [searchParams, googleLogin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(formData);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative"
            style={{backgroundImage: `url(${BgLogin})`}}
        >
            {/* Dark/Warm Tint Overlay */}
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

            <Card variant="auth" className="relative z-10 animate-fade-in">
                {/* Header Logo & Title */}
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 p-2 flex items-center justify-center border border-amber-500/30 shadow-md">
                            <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Sign in to access your digital member card and orders
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="space-y-1.5">
                        <InputIcon
                            label="Password"
                            type="password"
                            name="password"
                            icon={<HiOutlineLockClosed />}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            error={errors.password}
                            required
                        />
                        <div className="text-right">
                            <Link
                                to="/forget-password"
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        className="mt-2"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
                            Or continue with
                        </span>
                    </div>
                </div>

                <GoogleSignInButton
                    onClick={googleLoginRedirect}
                    loading={loading}
                />

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                    Don't have an account yet?{" "}
                    <Link
                        to="/register"
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
