'use client'

import { Package, Truck, MapPin, Clock, CheckCircle, Phone } from 'lucide-react'

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-black py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-4 inline-block rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-1 text-sm font-medium text-amber-200">
            Delivery Information
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-light tracking-tight text-white lg:text-6xl">
            Shipping & <br />
            <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Delivery Policy
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Fast, reliable delivery across Kenya. Get your tech products delivered safely to your doorstep.
          </p>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-light text-zinc-900 lg:text-4xl">
              Delivery <span className="font-semibold">Options</span>
            </h2>
            <p className="mx-auto max-w-2xl text-zinc-600">
              We offer flexible delivery options to suit your needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-zinc-200 p-8">
              <Truck className="mb-4 h-12 w-12 text-amber-600" />
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">Standard Delivery</h3>
              <p className="mb-4 text-sm text-zinc-600">Within Nairobi: 1-2 business days</p>
              <p className="mb-4 text-sm text-zinc-600">Outside Nairobi: 2-4 business days</p>
              <p className="text-2xl font-bold text-zinc-900">KSh 200 - 500</p>
            </div>

            <div className="border border-amber-600 bg-amber-50 p-8">
              <Package className="mb-4 h-12 w-12 text-amber-600" />
              <div className="mb-2 inline-block rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                POPULAR
              </div>
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">Express Delivery</h3>
              <p className="mb-4 text-sm text-zinc-600">Same-day delivery within Nairobi</p>
              <p className="mb-4 text-sm text-zinc-600">Order before 2 PM</p>
              <p className="text-2xl font-bold text-zinc-900">KSh 800</p>
            </div>

            <div className="border border-zinc-200 p-8">
              <MapPin className="mb-4 h-12 w-12 text-amber-600" />
              <h3 className="mb-2 text-xl font-semibold text-zinc-900">Pick Up</h3>
              <p className="mb-4 text-sm text-zinc-600">Collect from our Nairobi location</p>
              <p className="mb-4 text-sm text-zinc-600">Ready within 2 hours</p>
              <p className="text-2xl font-bold text-zinc-900">FREE</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-zinc-200 bg-zinc-50 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-light text-zinc-900 lg:text-4xl">
              How It <span className="font-semibold">Works</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                icon: Package,
                step: '1',
                title: 'Order Placed',
                description: 'Complete your purchase online or via phone',
              },
              {
                icon: CheckCircle,
                step: '2',
                title: 'Order Confirmed',
                description: 'Receive confirmation via SMS/Email',
              },
              {
                icon: Truck,
                step: '3',
                title: 'Package Shipped',
                description: 'Track your order in real-time',
              },
              {
                icon: MapPin,
                step: '4',
                title: 'Delivered',
                description: 'Receive your products safely',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-zinc-200 bg-white">
                    <item.icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Delivery Coverage</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-zinc-900">Within Nairobi</h3>
                  <p className="text-zinc-600">
                    We deliver to all areas within Nairobi and its environs including Westlands, Kilimani, Karen, Kileleshwa, Lavington, and more.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold text-zinc-900">Nationwide Delivery</h3>
                  <p className="text-zinc-600">
                    We ship to all major towns across Kenya including Mombasa, Kisumu, Nakuru, Eldoret, and more. Delivery time varies by location.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 p-8">
              <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Important Notes</h2>
              <ul className="space-y-4">
                {[
                  'Free delivery for orders above KSh 10,000 within Nairobi',
                  'All deliveries require a signature upon receipt',
                  'Please inspect items before accepting delivery',
                  'Delivery times are estimates and may vary',
                  'We deliver Monday to Saturday, 8 AM - 6 PM',
                  'Contact us for specific delivery time requests',
                ].map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span className="text-zinc-700">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-zinc-200 py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Have Questions About Delivery?</h2>
          <p className="mb-8 text-zinc-600">Our customer service team is here to help</p>
          <a
            href="tel:+254799954672"
            className="inline-flex items-center gap-2 border border-zinc-900 px-8 py-4 font-medium text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
          >
            <Phone className="h-5 w-5" />
            Call +254 799 954 672
          </a>
        </div>
      </section>
    </div>
  )
}
