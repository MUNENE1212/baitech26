'use client'

import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'Orders & Payment',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept M-Pesa, bank transfers, and cash on delivery for select items. All major payment methods are secure and encrypted.',
        },
        {
          question: 'How do I track my order?',
          answer:
            'Once your order is shipped, you will receive a tracking number via SMS and email. You can use this to track your delivery in real-time.',
        },
        {
          question: 'Can I cancel or modify my order?',
          answer:
            'Yes, you can cancel or modify your order within 2 hours of placing it. Contact us immediately at +254 799 954 672 or via WhatsApp.',
        },
      ],
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          question: 'How long does delivery take?',
          answer:
            'Standard delivery within Nairobi takes 1-2 business days. Outside Nairobi, it takes 2-4 business days. Express same-day delivery is available for orders placed before 2 PM.',
        },
        {
          question: 'Do you offer free shipping?',
          answer:
            'Yes! We offer free standard delivery for orders above KSh 10,000 within Nairobi. Outside Nairobi, shipping costs vary by location.',
        },
        {
          question: 'What if I\'m not home for delivery?',
          answer:
            'Our delivery team will call you before arrival. If you\'re not available, we can arrange a convenient time or you can collect from our office.',
        },
      ],
    },
    {
      category: 'Products & Services',
      questions: [
        {
          question: 'Are your products genuine?',
          answer:
            'Yes, absolutely! We source all our products from authorized distributors and manufacturers. All items come with manufacturer warranties.',
        },
        {
          question: 'Do you offer warranties?',
          answer:
            'Yes, all products come with manufacturer warranties ranging from 3 months to 2 years depending on the item. We also offer extended warranty options.',
        },
        {
          question: 'Can you repair devices bought elsewhere?',
          answer:
            'Yes, our expert technicians can repair devices purchased from any retailer. Contact us for a free diagnostic assessment.',
        },
      ],
    },
    {
      category: 'Returns & Refunds',
      questions: [
        {
          question: 'What is your return policy?',
          answer:
            'We accept returns within 7 days of delivery if the item is unused, in original packaging, and with all accessories. See our full return policy for details.',
        },
        {
          question: 'How long do refunds take?',
          answer:
            'Refunds are processed within 5-7 business days after we receive and inspect the returned item. M-Pesa refunds are typically instant once approved.',
        },
        {
          question: 'What if my item arrives damaged?',
          answer:
            'Contact us immediately with photos of the damaged item. We will arrange for a replacement or full refund at no cost to you.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Help Center
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Frequently Asked <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Find quick answers to common questions about our products, services, and policies.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold text-zinc-900">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const index = categoryIndex * 100 + questionIndex
                    const isOpen = openIndex === index
                    return (
                      <div key={questionIndex} className="border border-zinc-200">
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50"
                        >
                          <span className="pr-8 font-semibold text-zinc-900">{faq.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 flex-shrink-0 text-zinc-600 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-zinc-200 bg-zinc-50 p-6">
                            <p className="leading-relaxed text-zinc-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Still Have Questions?</h2>
          <p className="mb-8 text-zinc-600">
            Can't find the answer you're looking for? Our team is here to help.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact-us"
              className="inline-block border border-zinc-900 px-8 py-4 font-medium text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
            >
              Contact Us
            </a>
            <button
              onClick={() => openWhatsApp(generateGeneralInquiryUrl())}
              className="inline-flex items-center gap-2 border border-emerald-600 bg-emerald-600 px-8 py-4 font-medium text-white transition-all hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
