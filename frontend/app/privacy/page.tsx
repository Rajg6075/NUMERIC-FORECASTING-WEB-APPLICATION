import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Game Results',
  description: 'Privacy policy for the Game Results platform',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none prose-sm sm:prose-base">
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              This Privacy Policy applies to all users of this website, whether registered or unregistered.
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">1. Information We Collect</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
                  We may collect the following information:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300 ml-4 text-sm sm:text-base">
                  <li>Name</li>
                  <li>Phone Number</li>
                  <li>Email Address</li>
                  <li>IP Address</li>
                  <li>Browser details, operating system, device information</li>
                  <li>Location details (where applicable)</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-2 sm:mt-3 text-sm sm:text-base">
                  This information is collected to improve our services and provide a better user experience.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">2. Usage of Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">
                  The collected information is used only for:
                </p>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-300 ml-4 text-sm sm:text-base">
                  <li>Improving website performance</li>
                  <li>Enhancing user experience</li>
                  <li>Communication purposes (if required)</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">3. No External Tracking</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  We do not track your activity outside of this website.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">4. Information Sharing</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  We do not sell or share your personal information with third parties for profit.
                  However, we may share information if required by law, court order, or any legal authority.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">5. Game Registration Contact</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  When contacting us for game registration or uploading new games, your contact information will be used only for communication purposes related to your request.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">6. User Control</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Users can request modification or removal of their data by contacting the website administrator.
                </p>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">7. Acceptance of Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  By using this website, you agree to this Privacy Policy and our Terms & Conditions.
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
