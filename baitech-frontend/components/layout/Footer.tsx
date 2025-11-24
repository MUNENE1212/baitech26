'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageCircle, ArrowUp, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { generateGeneralInquiryUrl, openWhatsApp } from '@/lib/utils/whatsapp'

const quickLinks = [
  { name: 'All Products', href: '/catalogue' },
  { name: 'Our Services', href: '/services' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact-us' },
]

const customerCare = [
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'Shipping Info', href: '/shipping-info' },
  { name: 'Returns', href: '/returns' },
  { name: 'FAQ', href: '/faq' },
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
  { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
  { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [showScrollTop, setShowScrollTop] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-zinc-400 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-50" />

      <div className="relative container mx-auto px-6 py-20 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Logo variant="dark" size="md" />
            <p className="text-sm leading-relaxed text-zinc-400">
              Premium technology and expert services. Your trusted partner for all tech needs.
            </p>

            {/* Social Links with hover effects */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 transition-all ${social.color} hover:text-white hover:border-transparent shadow-lg hover:shadow-xl`}
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-zinc-400 transition-all hover:text-amber-400"
                  >
                    <motion.span
                      className="mr-2 opacity-0 group-hover:opacity-100"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      →
                    </motion.span>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Care */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Customer Care
            </h3>
            <ul className="space-y-3">
              {customerCare.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="group inline-flex items-center text-sm text-zinc-400 transition-all hover:text-amber-400"
                  >
                    <motion.span
                      className="mr-2 opacity-0 group-hover:opacity-100"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      →
                    </motion.span>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-amber-400">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <motion.li
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 group-hover:text-amber-400 transition-colors" />
                <a href="tel:+254799954672" className="text-sm text-zinc-400 transition-colors hover:text-amber-400">
                  +254 799 954 672
                </a>
              </motion.li>
              <motion.li
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 group-hover:text-amber-400 transition-colors" />
                <a href="mailto:mnent2025@gmail.com" className="text-sm text-zinc-400 transition-colors hover:text-amber-400 break-all">
                  mnent2025@gmail.com
                </a>
              </motion.li>
              <motion.li
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 group-hover:text-amber-400 transition-colors" />
                <span className="text-sm text-zinc-400">Nairobi, Kenya</span>
              </motion.li>
              <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => openWhatsApp(generateGeneralInquiryUrl())}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-600/50 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-amber-500 hover:to-orange-500 shadow-lg hover:shadow-xl hover:shadow-amber-500/50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </button>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 md:flex-row"
        >
          <p className="text-xs text-zinc-500 flex items-center gap-2">
            &copy; {currentYear} Baitech Solutions. Made with
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            </motion.span>
            in Kenya
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
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/50 transition-all"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  )
}
