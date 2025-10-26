'use client'

import { useCart } from '@/hooks/useCart'
import { generateCartWhatsAppUrl, openWhatsApp } from '@/lib/utils/whatsapp'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsAppCheckout() {
  const { items, totalItems } = useCart()

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty', {
        description: 'Add some products before placing an order',
      })
      return
    }

    const url = generateCartWhatsAppUrl(items)
    openWhatsApp(url)

    toast.success('Opening WhatsApp', {
      duration: 2000,
      description: `Placing order for ${totalItems} item${totalItems > 1 ? 's' : ''}`,
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <button
      onClick={handleWhatsAppCheckout}
      className="group flex w-full items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-6 py-4 font-medium text-white transition-all hover:bg-emerald-700"
    >
      <MessageCircle className="h-5 w-5" />
      <span>Complete Order via WhatsApp</span>
    </button>
  )
}
