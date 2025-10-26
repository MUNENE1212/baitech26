'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-400">
      <div className="container mx-auto px-6 py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
                <span className="text-xl font-bold text-white">E</span>
              </div>
              <h3 className="text-2xl font-light text-white">
                Emen<span className="font-semibold">Tech</span>
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              Premium technology and expert services. Where innovation meets craftsmanship.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all hover:border-amber-500 hover:bg-amber-500 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all hover:border-amber-500 hover:bg-amber-500 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all hover:border-amber-500 hover:bg-amber-500 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {['All Products', 'Our Services', 'Login', 'Signup'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Customer Care
            </h3>
            <ul className="space-y-3">
              {['Contact Us', 'Shipping Info', 'Returns', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <a href="tel:+254799954672" className="text-sm text-zinc-400 transition-colors hover:text-amber-400">
                  +254 799 954 672
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <a href="mailto:mnent2025@gmail.com" className="text-sm text-zinc-400 transition-colors hover:text-amber-400">
                  mnent2025@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span className="text-sm text-zinc-400">Nairobi, Kenya</span>
              </li>
              <li>
                <button
                  onClick={() => openWhatsApp(generateGeneralInquiryUrl())}
                  className="mt-2 flex w-full items-center justify-center gap-2 border border-amber-600 bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-amber-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 md:flex-row">
          <p className="text-xs text-zinc-500">
            &copy; {currentYear} EmenTech. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-zinc-500 transition-colors hover:text-amber-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-zinc-500 transition-colors hover:text-amber-400"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
