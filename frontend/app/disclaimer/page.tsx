import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Content Disclaimer | Game Results',
  description: 'Content disclaimer for the Game Results platform',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Disclaimer
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none prose-sm sm:prose-base">
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              This disclaimer applies to all content published, hosted, or available on this website, whether directly or indirectly.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">1. Purpose of Website</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  The purpose of this website is to provide mathematical observations, analysis, and case studies related to uncertain events. These events may range from simple probability scenarios (like coin toss) to other uncertain outcomes.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
                  We are not connected with, nor do we support or promote any form of gambling activities.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">2. No Gambling Involvement</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  We do not organize, operate, or participate in any gambling activities directly or indirectly. The content provided is strictly for informational and educational purposes only.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">3. User Responsibility</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
                  By using this website, you agree that:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300 ml-4 text-sm sm:text-base">
                  <li>You are solely responsible for your actions</li>
                  <li>Any decisions made based on the content are at your own risk</li>
                  <li>We are not liable for any financial loss or consequences</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">4. Risk Awareness</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Our intention is to spread awareness about risks involved in uncertain events, especially those that may lead to financial loss. The content aims to help users understand the mathematical aspects of such situations.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">5. Content Suitability</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
                  Some content on this website may not be suitable for all users.
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300 ml-4 text-sm sm:text-base">
                  <li>This website is intended for users above 21 years of age</li>
                  <li>Users must ensure that accessing this content is legal in their jurisdiction</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">6. Geographic Restriction</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  This website is not intended for users residing in regions where such content may be restricted or prohibited by law. Users are responsible for complying with their local laws.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">7. Declaration</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
                  We clearly declare that:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300 ml-4 text-sm sm:text-base">
                  <li>We do not support or promote gambling in any form</li>
                  <li>We are not involved in any gambling-related activities</li>
                  <li>This website is purely based on mathematical analysis and risk awareness</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">8. Acceptance</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  By accessing or using this website, you agree to this Disclaimer and all related Terms & Conditions.
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-white/10 text-xs sm:text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
