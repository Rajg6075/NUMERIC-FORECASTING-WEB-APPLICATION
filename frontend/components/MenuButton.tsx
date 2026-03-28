'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Lock } from 'lucide-react';

export default function MenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Lock, label: 'Login', href: '/admin/login' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Menu"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        <span className="hidden sm:inline text-sm font-semibold ml-1">Menu</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.href} className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm">
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
