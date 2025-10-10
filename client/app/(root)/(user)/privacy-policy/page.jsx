import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
            <div className="prose prose-gray max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to Basiks. We respect your privacy and are committed
                  to protecting your personal data. This privacy policy will
                  inform you about how we look after your personal data when you
                  visit our website and tell you about your privacy rights and
                  how the law protects you.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Personal Information
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We may collect personal information such as your name,
                      email address, phone number, and shipping address when you
                      create an account or make a purchase.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Usage Data
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We automatically collect information about how you use our
                      website, including your IP address, browser type, pages
                      visited, and time spent on our site.
                    </p>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>To process and fulfill your orders</li>
                  <li>To communicate with you about your account and orders</li>
                  <li>To improve our website and services</li>
                  <li>To send you promotional emails (with your consent)</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Information Sharing
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except as
                  described in this policy. We may share your information with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Service providers who help us operate our business</li>
                  <li>Payment processors to handle transactions</li>
                  <li>Shipping companies to deliver your orders</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. However, no method of transmission
                  over the internet is 100% secure.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing</li>
                  <li>Data portability</li>
                </ul>
              </section>

              {/* Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to improve
                  your browsing experience, analyze website traffic, and
                  personalize content. You can manage your cookie preferences
                  through your browser settings.
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this privacy policy or our
                  privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@basiks.com
                    <br />
                    <strong>Phone:</strong> +1 (555) 123-4567
                    <br />
                    <strong>Address:</strong> 123 Business Street, City, State
                    12345
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
