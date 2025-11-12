'use client'

import { FileText, Scale, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Legal
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Terms of <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Please read these terms carefully before using our services
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
                <FileText className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">1. Introduction</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <p>
                  Welcome to Baitech. By accessing or using our website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
                <p>
                  If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </div>
            </div>

            {/* Use of Service */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Scale className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">2. Use of Service</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <h3 className="font-semibold text-zinc-900">2.1 Eligibility</h3>
                <p>
                  You must be at least 18 years old to make purchases on our website. By placing an order, you represent that you are of legal age to form a binding contract.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">2.2 Account Responsibility</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">2.3 Prohibited Activities</h3>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Using our service for any illegal purpose</li>
                  <li>Attempting to interfere with the proper functioning of the website</li>
                  <li>Uploading malicious code or viruses</li>
                  <li>Impersonating another person or entity</li>
                  <li>Harvesting or collecting information about other users</li>
                </ul>
              </div>
            </div>

            {/* Products & Pricing */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">3. Products & Pricing</h2>
              </div>
              <div className="space-y-4 text-zinc-700">
                <h3 className="font-semibold text-zinc-900">3.1 Product Information</h3>
                <p>
                  We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">3.2 Pricing</h3>
                <p>
                  All prices are listed in Kenyan Shillings (KSh) and are subject to change without notice. We reserve the right to correct any pricing errors on our website.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">3.3 Availability</h3>
                <p>
                  All products are subject to availability. We reserve the right to discontinue any product at any time.
                </p>
              </div>
            </div>

            {/* Orders & Payment */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">4. Orders & Payment</h2>
              <div className="space-y-4 text-zinc-700">
                <h3 className="font-semibold text-zinc-900">4.1 Order Acceptance</h3>
                <p>
                  Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to refuse or cancel any order for any reason.
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">4.2 Payment</h3>
                <p>
                  Payment must be received before order processing. We accept M-Pesa, bank transfers, and cash on delivery (where available).
                </p>

                <h3 className="mt-6 font-semibold text-zinc-900">4.3 Payment Security</h3>
                <p>
                  All transactions are processed securely. We do not store complete credit card or M-Pesa PIN information.
                </p>
              </div>
            </div>

            {/* Warranties & Disclaimers */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">5. Warranties & Disclaimers</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  All products are covered by manufacturer warranties as specified. We are not responsible for manufacturer defects beyond facilitating warranty claims.
                </p>
                <p className="uppercase font-semibold">
                  OUR SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">6. Limitation of Liability</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  To the maximum extent permitted by law, Baitech shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.
                </p>
                <p>
                  Our total liability shall not exceed the amount paid by you for the product or service in question.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">7. Intellectual Property</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  All content on this website, including text, graphics, logos, and images, is the property of Baitech or its content suppliers and is protected by copyright laws.
                </p>
                <p>
                  You may not reproduce, distribute, or create derivative works from our content without express written permission.
                </p>
              </div>
            </div>

            {/* Governing Law */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">8. Governing Law</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms shall be resolved in the courts of Kenya.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12 border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">9. Changes to Terms</h2>
              <div className="space-y-4 text-zinc-700">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
                </p>
                <p>
                  Your continued use of the service after any changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-zinc-200 pt-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">10. Contact Information</h2>
              <div className="space-y-4 text-zinc-700">
                <p>If you have any questions about these Terms, please contact us:</p>
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
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Questions About Our Terms?</h2>
          <p className="mb-8 text-zinc-600">Our team is here to help clarify any concerns</p>
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
