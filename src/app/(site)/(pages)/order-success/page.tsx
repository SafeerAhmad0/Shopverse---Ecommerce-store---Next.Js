"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Breadcrumb from "@/components/Common/Breadcrumb"

export default function OrderSuccess() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")

  return (
    <>
      <Breadcrumb title="Order Confirmation" pages={["order-success"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[600px] w-full mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-dark mb-3">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your order. We&apos;ve received your order and will process it shortly.
            </p>

            {orderNumber && (
              <div className="bg-gray-1 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Your Order Number</p>
                <p className="text-2xl font-bold text-blue">{orderNumber}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/my-account"
                className="block w-full py-3 px-6 bg-blue text-white rounded-lg font-medium hover:bg-blue-dark transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/shop-with-sidebar"
                className="block w-full py-3 px-6 border-2 border-gray-3 text-dark rounded-lg font-medium hover:border-blue hover:text-blue transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
