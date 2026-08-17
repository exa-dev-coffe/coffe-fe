import React, {useState} from "react";
import {Link} from "react-router";
import useAuth from "@/features/auth/hooks/useAuth.ts";
import Card from "@/components/ui/Card.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import IconLogo from "@/assets/images/icon.png";
import BgLogin from "@/assets/images/bgLogin.webp";
import {HiOutlineMail, HiArrowLeft} from "react-icons/hi";

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const {forgotPassword, loading, errors} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await forgotPassword({email});
        if (success) {
            setSent(true);
        }
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
                        Reset Password
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {sent
                            ? "Check your inbox for password reset instructions"
                            : "Enter your email and we'll send you a recovery link"}
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-6">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
                            We've sent a password reset link to <strong>{email}</strong>. Please follow the instructions in the email.
                        </div>
                        <Link to="/login" className="inline-block">
                            <Button variant="outline" size="md">
                                Return to Sign In
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputIcon
                            label="Registered Email"
                            type="email"
                            name="email"
                            icon={<HiOutlineMail />}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                        >
                            Send Reset Link
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

export default ForgotPasswordPage;
