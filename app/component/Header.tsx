'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Settings, User, LogOut, Mail, IdCard, AtSign, ShieldCheck, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const tabs = [
  { name: 'Upload Project', path: '/' },
  { name: 'View Project', path: '/dashboard' },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('Upload');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = tabs.find(tab => tab.path === pathname);
    if (active) setActiveTab(active.name);
  }, [pathname]);

  useEffect(() => {
    const updateIndicatorStyle = () => {
      if (navRef.current) {
        const tabsContainer = navRef.current.children[0] as HTMLElement;
        const index = tabs.findIndex(tab => tab.name === activeTab);
        const el = tabsContainer.children[index] as HTMLElement;
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
    <header className="sticky top-0 z-[1000] w-full bg-[#F7F7F7] pb-2">
      <div className="max-w-[1600px] mx-auto px-4 pt-2">
        <div
          style={{
            height: '80px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #eaeaea',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 40px',
          }}
        >
      {/* LEFT: Logo + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Logo */}
        <Link href="/">
          <Image
            src="/Rehabilitation department logo of Palghar 1.png"
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
        {/* <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Bell size={22} />
        </button>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Settings size={22} />
        </button> */}

        <ProfileMenu />
      </div>
    </div>
  </div>
</header>
  );
};

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      setAuthUser(parsed);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const displayName =
    (typeof authUser?.name === "string" && authUser.name) ||
    (typeof authUser?.username === "string" && authUser.username) ||
    "User";
  const username =
    (typeof authUser?.username === "string" && authUser.username) || "-";
  const email =
    (typeof authUser?.email === "string" && authUser.email) || "-";
  const userId =
    (typeof authUser?.userId === "string" && authUser.userId) || "-";
  const role =
    (typeof authUser?.role === "string" && authUser.role) ||
    "Authenticated User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("isLoggedIn");
    setOpen(false);
    setProfileOpen(false);
    router.replace("/login");
  };

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
            onClick={() => {
              setOpen(false);
              setProfileOpen(true);
            }}
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
            onClick={handleLogout}
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

      {profileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setProfileOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '20px',
              border: '1px solid #dbe4ef',
              background: '#ffffff',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 22px',
                background:
                  'linear-gradient(135deg, rgba(9,181,86,0.12), rgba(59,130,246,0.10))',
                borderBottom: '1px solid #e5edf7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #09b556, #0ea5e9)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    {displayName}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
                    Profile Overview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
                aria-label="Close profile"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '18px 22px 22px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                {[
                  { key: 'Email', value: email, icon: <Mail size={14} /> },
                  { key: 'Username', value: username, icon: <AtSign size={14} /> },
                  { key: 'User ID', value: userId, icon: <IdCard size={14} /> },
                  { key: 'Role', value: role, icon: <ShieldCheck size={14} /> },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      background: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {item.icon}
                      {item.key}
                    </div>
                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#0f172a',
                        fontSize: '13px',
                        fontWeight: 600,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  border: '1px solid #86efac',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '6px 10px',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '999px',
                    background: '#16a34a',
                  }}
                />
                Logged in
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;