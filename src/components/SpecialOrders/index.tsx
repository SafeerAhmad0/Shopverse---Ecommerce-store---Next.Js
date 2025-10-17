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

  // Show sample data if no orders from database
  const displayOrders = orders.length > 0 ? orders : [
    {
      id: 'sample-1',
      title: 'Summer Flash Sale',
      description: 'Premium furniture collection at unbeatable prices. Limited stock available.',
      discount_percentage: 70,
      original_price: 1999.99,
      discounted_price: 599.99,
      image_url: '/images/homeP1/offer1.png',
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: 'sample-2',
      title: 'Weekend Special Deals',
      description: 'Exclusive weekend offers on best-selling items. This weekend only.',
      discount_percentage: 50,
      original_price: 899.99,
      discounted_price: 449.99,
      image_url: '/images/homeP1/offer3.png',
      end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }
  ]

  if (loading) return null

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 xl:px-6">
        {/* Section Title - Simple */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
            Limited Time Offers
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Special Deals
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Exclusive offers on premium quality furniture at amazing prices
          </p>
        </div>

        {/* Orders - Clean & Simple Design */}
        <div className="space-y-6">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-0">
                {/* Left Content - Simple & Clean */}
                <div className="flex flex-col justify-center px-6 lg:px-8 py-6 lg:py-8">
                  {/* Badge */}
                  {order.discount_percentage && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold rounded-full mb-3 w-fit">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {order.discount_percentage}% OFF
                    </span>
                  )}

                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {order.title}
                  </h3>

                  {order.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {order.description}
                    </p>
                  )}

                  {/* Pricing - Simple */}
                  {(order.original_price || order.discounted_price) && (
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 mb-4 border border-primary-100">
                      <div className="flex items-center gap-4 flex-wrap">
                        {order.discounted_price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                              ${order.discounted_price.toFixed(2)}
                            </span>
                            {order.original_price && (
                              <span className="text-base line-through text-gray-400 font-medium">
                                ${order.original_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                        {order.original_price && order.discounted_price && (
                          <span className="text-sm font-semibold text-green-600">
                            Save ${(order.original_price - order.discounted_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Countdown */}
                    {order.end_date && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-orange-700">
                          Ends {new Date(order.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}

                    {/* CTA Button - Simple */}
                    <Link
                      href="/shop-with-sidebar"
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Right Image - Simple */}
                <div className="relative h-64 lg:h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-primary-50/40 to-secondary-50/40">
                  {order.image_url ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={order.image_url}
                        alt={order.title}
                        fill
                        className="object-contain p-6"
                      />
                    </div>
                  ) : (
                    <svg
                      className="w-24 h-24 text-primary-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
