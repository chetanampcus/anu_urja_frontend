'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  dotColor?: string;
  badgeBg?: string;
  badgeText?: string;
}

interface CustomDropdownProps {
  label?: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  showSearch?: boolean;
  className?: string;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  showSearch = false,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`} ref={dropdownRef}>
      {label && <label className="block text-[#121212] text-[15px] font-normal">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-10 bg-white border border-[#e4e4e4] rounded-[10px] px-4 flex items-center justify-between transition-all focus:outline-none font-normal ${disabled ? 'opacity-60 cursor-not-allowed bg-[#f9fafb]' : ''}`}
        >
          <span className={`text-[14px] ${selectedOption ? 'text-[#121212]' : 'text-[#636363]'}`}>
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.dotColor && (
                  <div
                    className="flex items-center px-1.5 py-0.5 rounded-full gap-2 font-normal"
                    style={{ backgroundColor: selectedOption.badgeBg }}
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: selectedOption.dotColor }} />
                    <span className="font-normal text-[16px]" style={{ color: selectedOption.badgeText }}>{selectedOption.label}</span>
                  </div>
                )}
                {!selectedOption.dotColor && selectedOption.label}
              </div>
            ) : placeholder}
          </span>
          <ChevronDown
            className={`text-[#636363] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            size={16}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#e4e4e4] rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.08)] z-[100] overflow-hidden">
            {showSearch && (
              <div className="p-2 border-b border-[#f0f0f0]">
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    className="w-full h-10 pl-9 pr-4 text-[16px] font-normal bg-[#f9fafb] border border-[#e4e4e4] rounded-lg outline-none placeholder:text-[#636363]/40 placeholder:font-normal placeholder:text-[14px]"
                    placeholder="Find an item"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636363] opacity-50" size={16} />
                </div>
              </div>
            )}

            <div className="max-h-[240px] overflow-y-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-2.5 text-left text-[16px] font-normal hover:bg-[#f5f9ff] transition-colors flex items-center gap-2.5 ${value === option.value ? 'bg-[#ebfff4] text-[#09b556]' : 'text-[#121212]'}`}
                  >
                    {option.dotColor ? (
                      <div className="flex items-center px-1.5 py-0.5 rounded-full gap-2 transition-all hover:opacity-80 font-normal"
                        style={{
                          backgroundColor: option.badgeBg || '#f5f9ff',
                          color: option.badgeText || '#121212'
                        }}>
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: option.dotColor }} />
                        <span className="font-normal text-[14px] pr-2">{option.label}</span>
                      </div>
                    ) : (
                      <div className="w-full relative transition-colors">
                        {option.label}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[16px] text-[#636363] text-center italic">No items found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;