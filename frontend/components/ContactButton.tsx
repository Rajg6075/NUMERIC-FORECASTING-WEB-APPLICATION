'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, MessageSquare, Send, X, CheckCircle } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name must contain only alphabets';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone && !newErrors.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/[\s-]/g, ''), // Remove spaces and hyphens
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          message: formData.message.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      console.log('Contact form submitted successfully:', result);
      
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', city: '', state: '', message: '' });
        setErrors({ name: '', email: '', phone: '', message: '' });
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      // You could show an error message to the user here
      alert('Failed to send message. Please try again later.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  if (!isOpen) {
    return (
      showScrollTop && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 sm:bottom-24 sm:left-6 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/30 transition-all duration-300 z-50 group"
          title="Contact Us"
        >
          <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute -top-12 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Contact Us
          </span>
        </button>
      )
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[10000] mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            Contact Us
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Message Sent!</h4>
              <p className="text-gray-400">We'll get back to you soon.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-violet-400" />
                  <span className="text-gray-300">support@gamecharts.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-violet-400" />
                  <span className="text-gray-300">+91 98765 43210</span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:ring-violet-500/50'
                    }`} 
                    placeholder="Your name" 
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:ring-violet-500/50'
                    }`} 
                    placeholder="your@email.com" 
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:ring-violet-500/50'
                    }`} 
                    placeholder="9876543210" 
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Your city" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm" placeholder="Your state" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Message *</label>
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    rows={4} 
                    className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm resize-none ${
                      errors.message 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-gray-600 focus:ring-violet-500/50'
                    }`} 
                    placeholder="Your message..." 
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Message</>}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
