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
    <section className="py-8">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #C4A57B 0%, #9B8268 100%)' }}>
          {/* Background Pattern Lines */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="40" x2="40" y2="0" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lines)" />
            </svg>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Content */}
            <div className="flex flex-col justify-center px-8 lg:px-12 py-8 lg:py-10">
              {banner.subtitle && (
                <p className="text-xs font-bold tracking-wide mb-3 text-blue-600 uppercase">
                  {banner.subtitle}
                </p>
              )}

              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 text-dark leading-tight">
                {banner.title}
              </h2>

              {banner.description && (
                <p className="text-sm text-gray-800 mb-6 leading-relaxed">
                  {banner.description}
                </p>
              )}

              {/* Countdown Timer */}
              {timeLeft && (
                <div className="mb-6">
                  <div className="flex gap-2 items-center">
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hours", value: timeLeft.hours },
                      { label: "Minutes", value: timeLeft.minutes },
                      { label: "Seconds", value: timeLeft.seconds }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="bg-white w-12 h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-xl lg:text-2xl font-bold text-dark">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-xs font-medium mt-1 text-gray-700">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {banner.button_url && (
                <div>
                  <Link
                    href={banner.button_url}
                    className="inline-flex items-center justify-center text-sm font-bold text-white bg-blue hover:bg-blue-dark px-7 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {banner.button_text || "Check it Out!"}
                  </Link>
                </div>
              )}
            </div>

            {/* Right Image */}
            <div className="relative h-64 lg:h-full min-h-[280px] flex items-center justify-center">
              {banner.image_url ? (
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
