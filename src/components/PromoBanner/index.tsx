"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

interface PromoBanner {
  id: string
  title: string
  subtitle?: string
  description?: string
  discount_text?: string
  button_text?: string
  button_url?: string
  image_url?: string
  countdown_end?: string
  is_active: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function PromoBanner() {
  const [banner, setBanner] = useState<PromoBanner | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveBanner()
  }, [])

  useEffect(() => {
    if (!banner?.countdown_end) return

    const calculateTimeLeft = () => {
      const difference = +new Date(banner.countdown_end!) - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [banner])

  const fetchActiveBanner = async () => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .single()

      if (!error && data) {
        setBanner(data)
      }
    } catch (error) {
      console.error("Error fetching banner:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !banner) return null

  return (
    <section className="py-12 lg:py-14 bg-gradient-to-b from-white to-primary-50/20">
      <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-8 xl:px-6">
        <div
          className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-primary-100 via-secondary-50 to-primary-100 border border-primary-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
            {/* Left Content */}
            <div className="flex flex-col justify-center px-6 lg:px-10 py-8 lg:py-10">
              {banner.subtitle && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold rounded-full mb-3 w-fit uppercase tracking-wide">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {banner.subtitle}
                </span>
              )}

              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-800 to-secondary-700 bg-clip-text text-transparent mb-3 leading-tight">
                {banner.title}
              </h2>

              {banner.description && (
                <p className="text-sm text-gray-700 mb-5 leading-relaxed">
                  {banner.description}
                </p>
              )}

              {/* Countdown Timer - Simple */}
              {timeLeft && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-primary-700 mb-2 uppercase tracking-wide">Offer Ends In:</p>
                  <div className="flex gap-2 items-center">
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hours", value: timeLeft.hours },
                      { label: "Mins", value: timeLeft.minutes },
                      { label: "Secs", value: timeLeft.seconds }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="bg-white w-14 h-14 rounded-lg flex items-center justify-center shadow-md border border-primary-200">
                          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold mt-1 text-primary-700 uppercase">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {banner.button_url && (
                <Link
                  href={banner.button_url}
                  className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg w-fit"
                >
                  {banner.button_text || "Check it Out!"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>

            {/* Right Image */}
            <div className="relative h-72 lg:h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-primary-100/40 to-secondary-100/40">
              {banner.image_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                </div>
              ) : (
                <svg
                  className="w-24 h-24 text-primary-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}

              {/* Discount Badge */}
              {banner.discount_text && (
                <div className="absolute top-4 right-4 bg-gradient-to-br from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg font-bold text-base shadow-lg">
                  {banner.discount_text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
