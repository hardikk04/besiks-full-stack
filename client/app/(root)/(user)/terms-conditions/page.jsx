"use client";
import React, { useEffect } from "react";

const TermsAndConditionsPage = () => {
  useEffect(() => {
    document.title = "Besiks - Terms & Conditions";
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms & Conditions
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
                  Welcome to Basiks. These terms and conditions ("Terms") govern
                  your use of our website and services. By accessing or using
                  our website, you agree to be bound by these Terms. If you do
                  not agree to these Terms, please do not use our services.
                </p>
              </section>

              {/* Definitions */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Definitions
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <strong>"Company"</strong> refers to Basiks
                  </li>
                  <li>
                    <strong>"Service"</strong> refers to the website and all
                    related services
                  </li>
                  <li>
                    <strong>"User"</strong> refers to anyone who accesses or
                    uses our Service
                  </li>
                  <li>
                    <strong>"Content"</strong> refers to all text, images, and
                    other materials on our website
                  </li>
                </ul>
              </section>

              {/* Use of Service */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Use of Service
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Permitted Use
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      You may use our Service for lawful purposes only. You
                      agree to use the Service in accordance with all applicable
                      laws and regulations.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Prohibited Use
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      You may not:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>
                        Use the Service for any illegal or unauthorized purpose
                      </li>
                      <li>Violate any laws in your jurisdiction</li>
                      <li>
                        Transmit worms, viruses, or any code of a destructive
                        nature
                      </li>
                      <li>
                        Attempt to gain unauthorized access to our systems
                      </li>
                      <li>Interfere with or disrupt the Service</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Account Registration */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Account Registration
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features of our Service, you may be required
                  to create an account. When creating an account, you must
                  provide accurate and complete information. You are responsible
                  for maintaining the confidentiality of your account
                  credentials.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    You must be at least 18 years old to create an account
                  </li>
                  <li>
                    You are responsible for all activities under your account
                  </li>
                  <li>
                    You must notify us immediately of any unauthorized use
                  </li>
                  <li>
                    We reserve the right to suspend or terminate accounts that
                    violate these Terms
                  </li>
                </ul>
              </section>

              {/* Orders and Payment */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Orders and Payment
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Order Acceptance
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We reserve the right to refuse or cancel any order for any
                      reason. All orders are subject to acceptance and
                      availability.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Pricing
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      All prices are subject to change without notice. We
                      reserve the right to correct pricing errors. In case of a
                      pricing error, we will contact you before processing your
                      order.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Payment
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Payment must be received before order fulfillment. We
                      accept various payment methods as displayed on our
                      website. You represent that you have the legal right to
                      use any payment method you provide.
                    </p>
                  </div>
                </div>
              </section>

              {/* Shipping and Returns */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Shipping and Returns
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Shipping
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We will make every effort to ship orders within the
                      timeframe specified on our website. Shipping times may
                      vary based on location and product availability.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Returns
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Items may be returned within 30 days of delivery in their
                      original condition. Return shipping costs may apply.
                      Please see our detailed return policy for more
                      information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All content on our website, including text, graphics, logos,
                  images, and software, is owned by or licensed to Basiks and is
                  protected by copyright and other intellectual property laws.
                  You may not reproduce, distribute, or create derivative works
                  without our written permission.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To the fullest extent permitted by law, Basiks shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages, including loss of profits, data, or use,
                  incurred by you or any third party, whether in an action in
                  contract or tort.
                </p>
              </section>

              {/* Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Disclaimer
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Service is provided "as is" and "as available" without any
                  warranties of any kind. We do not warrant that the Service
                  will be uninterrupted, secure, or error-free.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time.
                  Changes will be effective immediately upon posting. Your
                  continued use of the Service after changes constitutes
                  acceptance of the new Terms.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms & Conditions,
                  please contact us:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@basiks.com
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

export default TermsAndConditionsPage;
