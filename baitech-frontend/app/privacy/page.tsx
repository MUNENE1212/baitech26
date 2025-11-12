'use client'

import { Shield, Eye, Lock, UserCheck, Database, Cookie } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Legal
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Privacy <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="mt-4 text-sm text-zinc-500">Last updated: November 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl">
            {/* Introduction */}
            <div className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">1. Introduction</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>
                  Baitech ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>
                <p>
                  By using our services, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Database className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">2. Information We Collect</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <h3 className="font-semibold text-zinc-900">2.1 Personal Information</h3>
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Name and contact information (email, phone number, address)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Purchase history and preferences</li>
                  <li>Communication records with our support team</li>
                </ul>

                <h3 className="mt-6 font-semibold text-zinc-900">2.2 Automatically Collected Information</h3>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clickstream data)</li>
                  <li>Location data (based on IP address)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Eye className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">3. How We Use Your Information</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your orders and inquiries</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Improve our website and services</li>
                  <li>Detect and prevent fraud and security issues</li>
                  <li>Comply with legal obligations</li>
                  <li>Analyze usage patterns and trends</li>
                </ul>
              </div>
            </div>

            {/* Information Sharing */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">4. Information Sharing</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>We may share your information with:</p>

                <h3 className="mt-6 font-semibold text-zinc-900">4.1 Service Providers</h3>
                <p>
                  Third-party companies that help us operate our business, such as payment processors, shipping companies, and email service providers.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">4.2 Legal Requirements</h3>
                <p>
                  When required by law, legal process, or government request, or to protect our rights and safety.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">4.3 Business Transfers</h3>
                <p>
                  In connection with any merger, sale, or transfer of our assets, your information may be transferred.
                </p>

                <p className="mt-6 font-semibold">
                  We do NOT sell your personal information to third parties for their marketing purposes.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">5. Data Security</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
                <div className="mt-6 border-l-4 border-amber-600 bg-amber-50 p-6">
                  <p className="font-semibold text-zinc-900">Security Measures Include:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure payment processing through trusted providers</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Employee training on data protection</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Cookie className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">6. Cookies and Tracking</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our website.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">Types of Cookies We Use:</h3>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing Cookies:</strong> Track your online activity to deliver relevant ads</li>
                </ul>

                <p className="mt-6">
                  You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">7. Your Privacy Rights</h2>
              <div className="space-y-4 text-zinc-700">
                <p>You have the right to:</p>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                  <li><strong>Delete:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Object:</strong> Object to certain processing of your information</li>
                  <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                </ul>

                <p className="mt-6">
                  To exercise these rights, contact us at mnent2025@gmail.com or call +254 799 954 672.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">8. Data Retention</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                </p>
                <p>
                  When we no longer need your information, we will securely delete or anonymize it.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">9. Children's Privacy</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  Our services are not intended for children under 18. We do not knowingly collect personal information from children.
                </p>
                <p>
                  If you believe we have collected information from a child, please contact us immediately.
                </p>
              </div>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">10. Changes to This Policy</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">11. Contact Us</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> mnent2025@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +254 799 954 672
                  </p>
                  <p>
                    <strong>Address:</strong> Nairobi, Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Questions About Your Privacy?</h2>
          <p className="mb-8 text-zinc-600">We're here to help address your concerns</p>
          <a
            href="/contact-us"
            className="inline-block border border-zinc-900 px-8 py-4 font-medium text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}
