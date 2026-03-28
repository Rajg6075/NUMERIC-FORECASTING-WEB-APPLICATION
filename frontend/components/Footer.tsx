'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black border-t border-gray-800 dark:border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Game Results. All rights reserved.
            </p>
          </div>
          
          <nav className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-white transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/disclaimer" 
              className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-white transition-colors duration-200"
            >
              Content Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
