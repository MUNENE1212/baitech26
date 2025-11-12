'use client'

import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'
import { useState } from 'react'

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - you can connect this to your backend API
    console.log('Form submitted:', formData)
    // For now, redirect to WhatsApp with the message
    const whatsappMessage = `Hi, I'm ${formData.name}.\n\nSubject: ${formData.subject}\n\nMessage: ${formData.message}\n\nEmail: ${formData.email}\nPhone: ${formData.phone}`
    window.open(`https://wa.me/254799954672?text=${encodeURIComponent(whatsappMessage)}`, '_blank')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Get in Touch
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            We'd Love to <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Have a question about our products or services? Need technical support? Our team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="tel:+254799954672"
              className="group border border-zinc-200 p-8 transition-all hover:border-amber-600 hover:shadow-lg"
            >
              <Phone className="mb-4 h-10 w-10 text-amber-600" />
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Phone
              </div>
              <div className="text-lg font-medium text-zinc-900 group-hover:text-amber-600">
                +254 799 954 672
              </div>
            </a>

            <a
              href="mailto:mnent2025@gmail.com"
              className="group border border-zinc-200 p-8 transition-all hover:border-amber-600 hover:shadow-lg"
            >
              <Mail className="mb-4 h-10 w-10 text-amber-600" />
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Email
              </div>
              <div className="text-lg font-medium text-zinc-900 group-hover:text-amber-600">
                mnent2025@gmail.com
              </div>
            </a>

            <div className="border border-zinc-200 p-8">
              <MapPin className="mb-4 h-10 w-10 text-amber-600" />
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Location
              </div>
              <div className="text-lg font-medium text-zinc-900">Nairobi, Kenya</div>
            </div>

            <div className="border border-zinc-200 p-8">
              <Clock className="mb-4 h-10 w-10 text-amber-600" />
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Business Hours
              </div>
              <div className="text-lg font-medium text-zinc-900">Mon-Sat: 8AM-8PM</div>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="border border-zinc-200 p-8 lg:p-12">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-zinc-300 px-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-zinc-300 px-4 py-3 focus:border-amber-600 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-zinc-300 px-4 py-3 focus:border-amber-600 focus:outline-none"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-zinc-700">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-zinc-300 px-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full border border-zinc-300 px-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 bg-amber-600 px-8 py-4 font-medium text-white transition-all hover:bg-amber-700 md:w-auto"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Quick Contact Options */}
            <div>
              <div className="mb-8 border border-zinc-200 bg-zinc-50 p-8 lg:p-12">
                <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Need Immediate Help?</h2>
                <p className="mb-6 text-zinc-600">
                  For urgent inquiries or quick questions, reach out to us directly via WhatsApp for faster response.
                </p>
                <button
                  onClick={() => openWhatsApp(generateGeneralInquiryUrl())}
                  className="inline-flex w-full items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-8 py-4 font-medium text-white transition-all hover:bg-emerald-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </button>
              </div>

              <div className="border border-zinc-200 p-8 lg:p-12">
                <h3 className="mb-4 text-xl font-semibold text-zinc-900">FAQs</h3>
                <p className="mb-4 text-zinc-600">
                  Looking for answers to common questions? Check out our FAQ page for quick help.
                </p>
                <a
                  href="/faq"
                  className="inline-block border border-zinc-900 px-6 py-3 font-medium text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
                >
                  View FAQs
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
