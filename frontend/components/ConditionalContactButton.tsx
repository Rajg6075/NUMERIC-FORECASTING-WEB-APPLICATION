'use client';

import { usePathname } from 'next/navigation';
import ContactButton from "@/components/ContactButton";

export default function ConditionalContactButton() {
  const pathname = usePathname();
  
  // Hide ContactButton on chart and admin pages
  if (pathname?.startsWith('/chart') || pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <ContactButton />;
}
