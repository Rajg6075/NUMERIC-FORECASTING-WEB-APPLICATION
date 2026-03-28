import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Game Results',
  description: 'Terms and conditions for using the Game Results platform',
};

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none prose-sm sm:prose-base">
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Welcome to our website. By accessing or using this website, you agree to comply with and be bound by the following terms and conditions.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">1. Use of Website</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  This website is provided for informational purposes only. All content available on this website is published on an "as is" basis without any warranty or guarantee.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">2. Game Results Viewing</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  This website displays game results for informational purposes. Users can view results and contact administrators for game registration or uploading new games.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">3. No Gambling Promotion</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  We provide information related to Matka/Satta only from a mathematical or informational perspective. We do not promote, support, or organize any form of gambling on this website or its related platforms.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">4. User Responsibility</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Users are solely responsible for their actions. Any decisions made based on the content of this website are at the user's own risk. We are not liable for any financial losses or consequences.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">5. Legal Disclaimer</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Users must understand that gambling may be illegal in their jurisdiction. By using this website, you agree that you are fully responsible for any legal issues that may arise.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">6. Content Usage</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  You agree not to copy, reproduce, or distribute content from this website without permission. Any misuse may result in appropriate action.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">7. Game Registration</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  For game registration or uploading new games, users must contact the website administrators through the provided contact channels.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">8. Admin Rights</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  The website administrator reserves the right to modify, remove any content, or deny game registration requests without prior notice if found violating these terms.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">9. Risk Acknowledgement</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  You acknowledge the risks involved in relying on information provided on this platform, which may lead to financial loss.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">10. Age Restriction</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  You must be at least 21 years old to access or use this website.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">11. Acceptance of Terms</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  By using this website, you confirm that you have read, understood, and agreed to these Terms & Conditions.
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
