"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

interface SpecialOrder {
  id: string
  title: string
  description?: string
  discount_percentage?: number
  original_price?: number
  discounted_price?: number
  image_url?: string
  start_date?: string
  end_date?: string
  is_active: boolean
}

export default function SpecialOrders() {
  const [orders, setOrders] = useState<SpecialOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveOrders()
  }, [])

  const fetchActiveOrders = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("special_offers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching special orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || orders.length === 0) return null

  return (
    <section className="py-10">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section Title */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
            Limited Time Offers
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Special Orders
          </h2>
        </div>

        {/* Orders */}
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="relative rounded-3xl overflow-hidden shadow-lg mb-8 group hover:shadow-xl transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, #FDFBF7 0%, #F5E6D3 50%, #E8D4BD 100%)'
            }}
          >
            {/* Decorative Side Lines - Left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-amber-800/30 to-transparent"></div>
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-700/20 to-transparent"></div>

            {/* Decorative Side Lines - Right */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-amber-800/30 to-transparent"></div>
            <div className="absolute right-2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-700/20 to-transparent"></div>

            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`dots-${order.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#8B7355"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${order.id})`} />
              </svg>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-0">
              {/* Left Content */}
              <div className="flex flex-col justify-center px-6 lg:px-10 py-6 lg:py-8">
                {/* Special Badge */}
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="text-orange-600 text-lg">⚡</span>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-300 shadow-sm">
                    Special Deal
                  </span>
                </div>

                <h2 className="text-xl lg:text-2xl xl:text-3xl font-black mb-2 text-gray-900 leading-tight">
                  {order.title}
                </h2>

                {order.description && (
                  <p className="text-xs lg:text-sm text-gray-700 mb-4 leading-relaxed line-clamp-2">
                    {order.description}
                  </p>
                )}

                {/* Pricing Box */}
                {(order.original_price || order.discounted_price || order.discount_percentage) && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-4 border border-gray-200 shadow-md">
                    <div className="flex items-center gap-3 flex-wrap">
                      {order.discount_percentage && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1.5 rounded-md font-black text-base shadow-md transform -rotate-2">
                          {order.discount_percentage}% OFF
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        {order.original_price && (
                          <span className="text-sm line-through text-gray-500">
                            ${order.original_price.toFixed(2)}
                          </span>
                        )}
                        {order.discounted_price && (
                          <span className="text-2xl lg:text-3xl font-black text-gray-900">
                            ${order.discounted_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Date Range */}
                  {order.end_date && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold">
                        Ends {new Date(order.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link
                    href="/shop-with-sidebar"
                    className="inline-flex items-center justify-center text-xs lg:text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Shop Now
                    <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Image with Overlay Effect */}
              <div className="relative h-48 lg:h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-amber-50/30 to-transparent">
                {order.image_url ? (
                  <>
                    <Image
                      src={order.image_url}
                      alt={order.title}
                      fill
                      className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-32 h-32 text-amber-300/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                )}

                {/* Floating Badge */}
                {order.discount_percentage && order.original_price && order.discounted_price && (
                  <div className="absolute top-8 right-8 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2 rounded-full font-black text-base shadow-xl border-2 border-white">
                    SAVE ${(order.original_price - order.discounted_price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
