"use client";

import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const pathname = usePathname(); 
  const router = useRouter();

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault(); 
    
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'FAQ', href: '/faq' }, 
    { name: 'Results', href: '/results' },
    { name: 'Records', href: '/records' },
    { name: 'Runners', href: '/runners' },
  ];

  return (
    <nav className="bg-lisle-blue text-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <div className="shrink-0 flex items-center group h-full py-2">
            <Link href="/" className="flex items-center gap-3 h-full">
              <Image 
                src="/lions.png" 
                alt="Lisle Lions Logo" 
                width={526}
                height={160} 
                priority 
                className="h-full w-auto object-contain group-hover:brightness-110 transition-all" 
              />
              
              <div className="flex flex-col justify-center">
                <span className="font-heading font-bold text-xl md:text-2xl tracking-tighter uppercase leading-none">
                  Lisle
                </span>
                <span className="font-heading font-light text-xs md:text-sm tracking-[0.2em] uppercase leading-none text-light-blue mt-1">
                  Cross Country
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-1 items-center">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 uppercase tracking-wide ${
                    isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-200 hover:text-light-blue hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Desktop Search */}
            <form 
              onSubmit={handleSearch}
              className="ml-4 flex items-center bg-black/20 rounded-full pl-4 pr-1 py-1 border border-white/10 focus-within:border-light-blue transition-all"
            >
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Site..." 
                className="bg-transparent text-white text-xs focus:outline-none w-24 xl:w-40 font-body placeholder-gray-400"
              />
              <button 
                type="submit"
                className="bg-light-blue rounded-full p-1.5 ml-2 hover:brightness-110 transition-all cursor-pointer"
              >
                <Search size={14} className="text-lisle-blue" />
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-lisle-blue border-t border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-6 space-y-1">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-md text-base font-medium ${
                    isActive ? 'text-light-blue bg-white/10' : 'text-light-gray hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};