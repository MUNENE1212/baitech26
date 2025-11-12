'use client'

import { RotateCcw, CheckCircle, XCircle, Phone } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Returns Policy
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Easy Returns & <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Refunds
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Your satisfaction is our priority. Learn about our hassle-free return and refund policy.
          </p>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-light text-zinc-900 lg:text-4xl">
              How to <span className="font-semibold">Return an Item</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Contact Us',
                description: 'Call or WhatsApp us within 7 days of delivery with your order number',
              },
              {
                step: '2',
                title: 'Return Authorization',
                description: 'We will review your request and provide return instructions',
              },
              {
                step: '3',
                title: 'Ship Back',
                description: 'Send the item back in original packaging with all accessories',
              },
            ].map((item, index) => (
              <div key={index} className="border border-zinc-200 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Policy */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Eligible Returns */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">Eligible for Return</h2>
              </div>
              <ul className="space-y-4">
                {[
                  'Item is unused and in original condition',
                  'Original packaging is intact',
                  'All accessories and documentation included',
                  'Returned within 7 days of delivery',
                  'Proof of purchase provided',
                  'Item is not on the exclusion list',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Eligible */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <h2 className="text-2xl font-semibold text-zinc-900">Not Eligible for Return</h2>
              </div>
              <ul className="space-y-4">
                {[
                  'Opened software or digital products',
                  'Customized or personalized items',
                  'Items damaged due to misuse',
                  'Products without original packaging',
                  'Items returned after 7 days',
                  'Clearance or final sale items',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Process */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <RotateCcw className="mx-auto mb-4 h-12 w-12 text-amber-600" />
              <h2 className="mb-4 text-3xl font-semibold text-zinc-900">Refund Timeline</h2>
              <p className="text-zinc-600">
                Once we receive and inspect your return, the refund process begins
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-zinc-200 p-6">
                <h3 className="mb-2 font-semibold text-zinc-900">Inspection (1-2 business days)</h3>
                <p className="text-zinc-600">
                  We inspect the returned item to ensure it meets our return criteria
                </p>
              </div>

              <div className="border border-zinc-200 p-6">
                <h3 className="mb-2 font-semibold text-zinc-900">Approval (Same day)</h3>
                <p className="text-zinc-600">
                  Once approved, we process the refund to your original payment method
                </p>
              </div>

              <div className="border border-zinc-200 p-6">
                <h3 className="mb-2 font-semibold text-zinc-900">Refund Processing (3-7 business days)</h3>
                <p className="text-zinc-600">
                  M-Pesa refunds are instant. Bank transfers may take 3-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Policy */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-zinc-900">Exchanges</h2>
            <p className="mb-8 text-zinc-600">
              If you receive a defective or wrong item, we will exchange it at no additional cost. Contact us immediately with photos of the issue.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-zinc-200 bg-white p-8">
                <h3 className="mb-2 font-semibold text-zinc-900">Defective Items</h3>
                <p className="text-zinc-600">
                  We will replace defective items within the warranty period
                </p>
              </div>
              <div className="border border-zinc-200 bg-white p-8">
                <h3 className="mb-2 font-semibold text-zinc-900">Wrong Items</h3>
                <p className="text-zinc-600">
                  If we sent the wrong product, we'll replace it immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Need Help with a Return?</h2>
          <p className="mb-8 text-zinc-600">Contact our customer service team</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="tel:+254799954672"
              className="inline-flex items-center gap-2 border border-zinc-900 px-8 py-4 font-medium text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
            >
              <Phone className="h-5 w-5" />
              Call +254 799 954 672
            </a>
            <a
              href="/contact-us"
              className="inline-block border border-zinc-300 px-8 py-4 font-medium text-zinc-700 transition-all hover:border-zinc-900"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
