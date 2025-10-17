"use client";
import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-16 lg:pb-20 xl:pb-24 pt-28 sm:pt-32 lg:pt-36 xl:pt-40 relative">
      {/* Beautiful Blue Gradient Background with Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-0 w-96 h-96 bg-gradient-to-br from-primary-200/40 to-secondary-200/40 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-secondary-200/40 to-primary-300/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-br from-primary-300/30 to-secondary-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 xl:px-6 relative z-10">
        {/* Modern Grid Layout with Better Positioning */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Hero Carousel - Better Positioned */}
          <motion.div
            className="xl:col-span-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl border border-primary-100/50 group hover:shadow-primary-200/50 transition-all duration-500 h-full">
              {/* Blue Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

              {/* Decorative Corner Accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/20 to-transparent rounded-bl-[100px] opacity-50"></div>

              <HeroCarousel />
            </div>
          </motion.div>

          {/* Offer Cards - Better Positioned & Redesigned */}
          <div className="xl:col-span-4 flex flex-col gap-5">
            <motion.div
              className="flex-1 relative rounded-2xl bg-gradient-to-br from-white to-primary-50/60 backdrop-blur-xl p-6 shadow-xl border border-primary-100 hover:shadow-2xl hover:shadow-primary-200/50 hover:scale-[1.02] transition-all duration-500 group overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold rounded-full mb-3 shadow-lg">
                      LIMITED OFFER
                    </span>
                    <h3 className="font-black text-2xl text-gray-900 group-hover:text-primary-600 transition-colors duration-300 leading-tight">
                      Cloud Nine Bed
                    </h3>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-black text-4xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        $699
                      </span>
                      <span className="font-semibold text-lg text-gray-400 line-through">
                        $999
                      </span>
                    </div>
                    <Link
                      href="/shop-with-sidebar"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-primary-300/50 hover:scale-105 transition-all duration-300"
                    >
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                  <div className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Image
                      src="/images/homeP1/offer3.png"
                      alt="Cloud Nine Bed"
                      width={120}
                      height={120}
                      className="drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 relative rounded-2xl bg-gradient-to-br from-white to-secondary-50/60 backdrop-blur-xl p-6 shadow-xl border border-secondary-100 hover:shadow-2xl hover:shadow-secondary-200/50 hover:scale-[1.02] transition-all duration-500 group overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 via-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-secondary-500 to-primary-500 text-white text-xs font-bold rounded-full mb-3 shadow-lg">
                      LIMITED OFFER
                    </span>
                    <h3 className="font-black text-2xl text-gray-900 group-hover:text-secondary-600 transition-colors duration-300 leading-tight">
                      Timeless Table
                    </h3>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-black text-4xl bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                        $699
                      </span>
                      <span className="font-semibold text-lg text-gray-400 line-through">
                        $999
                      </span>
                    </div>
                    <Link
                      href="/shop-with-sidebar"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-secondary-300/50 hover:scale-105 transition-all duration-300"
                    >
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                  <div className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Image
                      src="/images/homeP1/offer1.png"
                      alt="Timeless Table"
                      width={120}
                      height={120}
                      className="drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
