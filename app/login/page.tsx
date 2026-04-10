'use client';

import Image from 'next/image';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CaptchaResponse {
  captchaId: string;
  expiresIn: number;
  image: string;
}

interface LoginResponse {
  email: string;
  message: string;
  name: string;
  userId: string;
  username: string;
}

const LandingPage = () => {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaExpiresIn, setCaptchaExpiresIn] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCaptcha = useCallback(async () => {
    setIsLoadingCaptcha(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/captcha`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Unable to load captcha. Please try again.');
      }

      const data: CaptchaResponse = await response.json();
      setCaptchaId(data.captchaId);
      setCaptchaImage(data.image);
      setCaptchaExpiresIn(data.expiresIn || 180);
      setCaptchaValue('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to fetch captcha.',
      );
    } finally {
      setIsLoadingCaptcha(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  useEffect(() => {
    if (!captchaId) return undefined;

    const refreshInMs = Math.max(120000, (captchaExpiresIn - 10) * 1000);
    const timer = window.setTimeout(() => {
      fetchCaptcha();
    }, refreshInMs);

    return () => window.clearTimeout(timer);
  }, [captchaId, captchaExpiresIn, fetchCaptcha]);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim() || !captchaValue.trim()) {
      setErrorMessage('Please fill username/email, password, and captcha.');
      return;
    }

    if (!captchaId) {
      setErrorMessage('Captcha is not ready yet. Please refresh captcha.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: username.trim(),
          password: password.trim(),
          captchaId,
          captchaValue: captchaValue.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          payload?.message ||
            (response.status === 401
              ? 'Login failed. Check credentials/captcha.'
              : 'Login failed. Please try again.'),
        );
        setCaptchaValue('');
        await fetchCaptcha();
        return;
      }

      const userData = payload as LoginResponse;
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } catch {
      setErrorMessage('Unable to connect to login service.');
      setCaptchaValue('');
      await fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }, [apiBaseUrl, captchaId, captchaValue, fetchCaptcha, password, router, username]);

  return (
    <div className="w-full h-screen overflow-hidden flex lg:flex-row flex-col ibm-plex-sans-font">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image src="/bgimage.png" alt="Background Pattern" fill className="object-cover" />
      </div>

      {/* Left side image */}
      <div className="hidden lg:flex lg:w-[55%] h-screen relative">
        <Image src="/vish (1).png" alt="Team Working" fill className="object-cover" priority />
      </div>

      {/* Right side */}
      <div className="w-full lg:w-[55%] h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-95 bg-[#FAFAFA] text-slate-900 rounded-2xl shadow-[0px_4px_32px_rgba(0,0,0,0.12)] px-7 py-5 flex flex-col items-center gap-3">

          {/* Logo */}
          <div className="w-25">
            <Image
              src="/Rehabilitation department logo of Palghar 1.png"
              alt="Rehabilitation department logo of Palghar"
              width={80}
              height={30}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-black leading-snug">
              Department of Rehabilitation,Palghar District  
            </h1>
            <p className="text-[12px] text-[#636363] mt-0.5">
              Login to access your dashboard
            </p>
          </div>

          {/* User / Guest Toggle */}
          {/* Form */}
          <div className="w-full flex flex-col gap-2.5">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-black">Email Address Or Username</label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-9 border border-[#d1d5dc] bg-white text-slate-900 rounded-lg px-3 text-[12px] focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-black">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 border border-[#d1d5dc] bg-white text-slate-900 rounded-lg px-3 pr-9 text-[12px] focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-[11.5px] text-black cursor-pointer">
              Forgot password?
            </div>

            {/* Captcha */}
            <div className="w-full border border-[#d1d5dc] rounded-lg p-2.5 flex flex-col gap-1.5 bg-[#FAFAFA] shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="h-12 border-[1.5px] border-dashed border-[#d1d5dc] rounded-md flex items-center justify-center px-2 min-w-[170px] bg-white">
                  {captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="Captcha"
                      className="h-9 w-auto object-contain"
                    />
                  ) : (
                    <b className="text-[12px] text-[#3b3b3b]">Loading...</b>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={isLoadingCaptcha || isSubmitting}
                  className="h-8 px-3 text-[11px] text-slate-700 rounded-md border border-[#d1d5dc] bg-white hover:bg-[#f4f4f4] disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={isLoadingCaptcha ? 'animate-spin' : ''} />
                  {isLoadingCaptcha ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter Captcha"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value)}
                className="w-full h-8 border border-[#d1d5dc] bg-white text-slate-900 rounded-md px-3 text-[12px] focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {errorMessage ? (
              <p className="text-[12px] text-red-600">{errorMessage}</p>
            ) : null}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={isSubmitting || isLoadingCaptcha}
              className="w-full h-9 bg-[#09B556] text-white rounded-lg font-medium text-[13px] flex items-center justify-center hover:bg-[#07a04c] transition active:scale-95 shadow-md disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
