'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const tabs = [
  { name: 'Upload', path: '/' },
  { name: 'View', path: '/dashboard' },
];

const Header = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Upload');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const active = tabs.find(tab => tab.path === currentPath);
    if (active) setActiveTab(active.name);
  }, []);

  useEffect(() => {
    const updateIndicatorStyle = () => {
      if (navRef.current) {
        const index = tabs.findIndex(tab => tab.name === activeTab);
        const el = navRef.current.children[index] as HTMLElement;
        if (el) {
          setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
          });
        }
      }
    };

    updateIndicatorStyle();
    window.addEventListener('resize', updateIndicatorStyle);
    return () => window.removeEventListener('resize', updateIndicatorStyle);
  }, [activeTab]);

  const handleTabClick = (name: string, path: string) => {
    setActiveTab(name);
    router.push(path);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '95%',
        height: '80px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #eaeaea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        margin: '8px auto 0',
        zIndex: 1000,
      }}
    >
      {/* LEFT: Logo + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Logo */}
        <Link href="/">
          <Image
            src="/gov.png"
            width={60}
            height={10}
            alt="Logo"
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* Tabs */}
        <div style={{ position: 'relative' }} ref={navRef}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name, tab.path)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontWeight: 600,
                  fontSize: '15px',
                  color: activeTab === tab.name ? '#121212' : '#666',
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Active Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              height: '3px',
              backgroundColor: '#09b556',
              transition: 'all 0.3s ease',
              width: indicatorStyle.width,
              transform: `translateX(${indicatorStyle.left}px)`,
            }}
          />
        </div>
      </div>

      {/* RIGHT: Icons + Profile */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Bell size={22} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Settings size={22} />
        </button>

        <ProfileMenu />
      </div>
    </div>
  );
};

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '1px solid #c0d8fb',
          cursor: 'pointer',
        }}
      >
        <Image
          src="/ProfileIcon (1).jpg"
          width={32}
          height={32}
          alt="User"
          style={{ objectFit: 'cover' }}
        />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '170px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            border: '1px solid #eee',
            padding: '6px',
          }}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              width: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <User size={16} />
            My Profile
          </button>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              width: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#d91616',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;