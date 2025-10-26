'use client'

import { Award, Users, Target, Zap, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            About Us
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Elevating Digital <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Experiences Since 2020</span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            We're passionate about bringing the latest technology and expert services to businesses
            and individuals across Kenya.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Mission */}
            <div className="border border-zinc-200 rounded-lg p-12">
              <Target className="mb-6 h-12 w-12 text-amber-600" />
              <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Our Mission</h2>
              <p className="leading-relaxed text-zinc-600">
                To provide premium technology products and professional services that empower our
                customers to achieve their goals. We strive to be the trusted partner for all tech
                needs, delivering exceptional value through quality products, expert solutions, and
                outstanding customer service.
              </p>
            </div>

            {/* Vision */}
            <div className="border border-zinc-200 rounded-lg p-12">
              <Zap className="mb-6 h-12 w-12 text-amber-600" />
              <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Our Vision</h2>
              <p className="leading-relaxed text-zinc-600">
                To be Kenya's leading technology solutions provider, recognized for innovation,
                reliability, and customer satisfaction. We envision a future where cutting-edge
                technology is accessible to all, backed by expert support and professional services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block rounded-full border border-amber-300 bg-white px-4 py-1 text-sm font-medium text-amber-900">
              Core Values
            </div>
            <h2 className="text-3xl font-light text-zinc-900 lg:text-4xl">
              What <span className="font-semibold text-amber-600">Drives Us</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Award,
                title: 'Quality First',
                description: 'We curate only the best products and deliver services with excellence',
              },
              {
                icon: Users,
                title: 'Customer Focus',
                description:
                  'Your satisfaction is our priority. We listen, understand, and deliver',
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'Staying ahead with the latest technology and service methodologies',
              },
              {
                icon: Target,
                title: 'Integrity',
                description: 'Honest pricing, transparent processes, and ethical business practices',
              },
            ].map((value, index) => (
              <div key={index} className="border border-zinc-200 bg-white p-8">
                <value.icon className="mb-4 h-10 w-10 text-zinc-900" />
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">{value.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { number: '500+', label: 'Products Available' },
              { number: '1000+', label: 'Happy Customers' },
              { number: '50+', label: 'Expert Technicians' },
              { number: '24/7', label: 'Customer Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-5xl font-semibold text-zinc-900">{stat.number}</div>
                <div className="text-sm text-zinc-600">{stat.label}</div>
                <div className="mx-auto mt-4 h-px w-12 bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-block border border-zinc-200 bg-white px-4 py-1 text-sm font-medium text-zinc-700">
              Our Offerings
            </div>
            <h2 className="text-3xl font-light text-zinc-900 lg:text-4xl">
              Comprehensive <span className="font-semibold">Tech Solutions</span>
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Products */}
            <div className="border border-zinc-200 bg-white p-12">
              <h3 className="mb-6 text-2xl font-semibold text-zinc-900">Premium Products</h3>
              <ul className="space-y-4">
                {[
                  'Latest smartphones and mobile devices',
                  'Professional audio equipment',
                  'Computer accessories and peripherals',
                  'Smart home devices',
                  'Wearable technology',
                  'Genuine accessories and parts',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-zinc-900" />
                    <span className="text-zinc-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="border border-zinc-200 bg-white p-12">
              <h3 className="mb-6 text-2xl font-semibold text-zinc-900">Expert Services</h3>
              <ul className="space-y-4">
                {[
                  'Device repair and maintenance',
                  'Technical support and consultation',
                  'Installation and setup services',
                  'Software troubleshooting',
                  'Network configuration',
                  'Data recovery services',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-zinc-900" />
                    <span className="text-zinc-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-light text-zinc-900 lg:text-4xl">
              Let's Work <span className="font-semibold">Together</span>
            </h2>
            <p className="mb-8 text-zinc-600">
              Have questions or need assistance? Our team is here to help you find the perfect
              solution.
            </p>

            {/* Contact Methods */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <a
                href="tel:+254799954672"
                className="group border border-zinc-200 p-6 transition-all hover:border-zinc-900"
              >
                <Phone className="mx-auto mb-3 h-8 w-8 text-zinc-900" />
                <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                  Phone
                </div>
                <div className="text-zinc-900 group-hover:underline">+254 799 954 672</div>
              </a>

              <a
                href="mailto:mnent2025@gmail.com"
                className="group border border-zinc-200 p-6 transition-all hover:border-zinc-900"
              >
                <Mail className="mx-auto mb-3 h-8 w-8 text-zinc-900" />
                <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                  Email
                </div>
                <div className="text-zinc-900 group-hover:underline">mnent2025@gmail.com</div>
              </a>

              <div className="border border-zinc-200 p-6">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-zinc-900" />
                <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-600">
                  Location
                </div>
                <div className="text-zinc-900">Nairobi, Kenya</div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={() => openWhatsApp(generateGeneralInquiryUrl())}
              className="inline-flex items-center gap-2 border border-emerald-600 bg-emerald-600 px-8 py-4 font-medium text-white transition-all hover:bg-emerald-700"
            >
              <MessageCircle className="h-5 w-5" />
              Start a Conversation on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
