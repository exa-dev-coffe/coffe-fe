import React, {useState} from "react";
import {Link, useSearchParams} from "react-router";
import useAuth from "@/features/auth/hooks/useAuth.ts";
import Card from "@/components/ui/Card.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import IconLogo from "@/assets/images/icon.png";
import BgLogin from "@/assets/images/bgLogin.webp";
import {HiOutlineLockClosed, HiArrowLeft} from "react-icons/hi";

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [formData, setFormData] = useState({
        token,
        password: "",
        confirmPassword: "",
    });

    const {changePassword, loading, errors} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await changePassword({...formData, token});
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative"
            style={{backgroundImage: `url(${BgLogin})`}}
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
                        Set New Password
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Create a strong password for your account
                    </p>
                </div>

                {!token ? (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-rose-500 font-semibold">
                            Invalid or missing password reset token.
                        </p>
                        <Link to="/forget-password">
                            <Button variant="outline" size="md">
                                Request New Reset Link
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputIcon
                            label="New Password"
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
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            icon={<HiOutlineLockClosed />}
                            placeholder="Repeat new password"
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
                            Update Password
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            >
                                <HiArrowLeft /> Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
