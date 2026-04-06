'use client';

import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useState, useCallback } from 'react';

const LandingPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('User');
  const [captcha, setCaptcha] = useState('');

  const handleLogin = useCallback(() => {
    console.log('Login clicked', { username, password });
  }, [username, password]);

  return (
    <div className="w-full h-screen overflow-hidden flex lg:flex-row flex-col ibm-plex-sans-font">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image src="/bgimage.png" alt="Background Pattern" fill className="object-cover" />
      </div>

      {/* Left side image */}
      <div className="hidden lg:flex lg:w-[55%] h-screen relative">
        <Image src="/bg2.png" alt="Team Working" fill className="object-cover" priority />
      </div>

      {/* Right side */}
      <div className="w-full lg:w-[55%] h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-95 bg-white rounded-2xl shadow-[0px_4px_32px_rgba(0,0,0,0.12)] px-7 py-5 flex flex-col items-center gap-3">

          {/* Logo */}
          <div className="w-25">
            <Image
              src="/Energy Department Logo.jpg"
              alt="Energy Department Logo"
              width={80}
              height={30}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-[25px] font-bold text-black leading-snug">
              Energy Department System
            </h1>
            <p className="text-[12px] text-[#636363] mt-0.5">
              Login to access your dashboard
            </p>
          </div>

          {/* User / Guest Toggle */}
          {/* <div className="flex items-center bg-[#F1F1F1] rounded-full p-[3px]">
            {['User', 'Guest'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#1C79F5] text-white shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div> */}

          {/* Form */}
          <div className="w-full flex flex-col gap-2.5">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-black">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-9 border border-[#d1d5dc] rounded-lg px-3 text-[12px] focus:outline-none placeholder:text-[rgba(0,0,0,0.3)]"
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
                  className="w-full h-9 border border-[#d1d5dc] rounded-lg px-3 pr-9 text-[12px] focus:outline-none placeholder:text-[rgba(0,0,0,0.3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#636363]"
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
            <div className="w-full border border-[#d1d5dc] rounded-lg p-2.5 flex flex-col gap-1.5 bg-white shadow-sm">
              <div className="h-8 border-[1.5px] border-dashed border-[#d1d5dc] rounded-md flex items-center px-3 w-fit">
                <b className="text-[12px] text-[#3b3b3b]">W8uvs</b>
              </div>
              <input
                type="text"
                placeholder="Enter Captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-full h-8 border border-[#d1d5dc] rounded-md px-3 text-[12px] focus:outline-none"
              />
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              className="w-full h-9 bg-[#09B556] text-white rounded-lg font-medium text-[13px] flex items-center justify-center hover:bg-[#07a04c] transition active:scale-95 shadow-md"
            >
              Login
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
