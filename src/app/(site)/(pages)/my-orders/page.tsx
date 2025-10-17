"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import Breadcrumb from "@/components/Common/Breadcrumb"
import toast from "react-hot-toast"

interface OrderItem {
  id: string
  product_name: string
  product_image: string | null
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_first_name: string
  customer_last_name: string
  customer_phone: string | null
  billing_address: string
  billing_city: string
  billing_country: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  subtotal: number
  shipping_fee: number
  total: number
  payment_method: string | null
  payment_status: string
  status: string
  notes: string | null
  created_at: string
  order_items: OrderItem[]
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const checkAuthAndFetchOrders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      router.push('/signin')
      return
    }

    await fetchOrders(session.user.id)
  }, [supabase.auth, router])

  useEffect(() => {
    checkAuthAndFetchOrders()
  }, [checkAuthAndFetchOrders])

  const fetchOrders = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/create-order?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'paid': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumb title="My Orders" pages={["my-orders"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <Breadcrumb title="My Orders" pages={["my-orders"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-dark mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet.</p>
              <a
                href="/shop-with-sidebar"
                className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-lg hover:bg-blue-dark transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-blue">{order.order_number}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-dark">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-3">
                        {order.order_items.slice(0, 4).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-1 min-w-[200px]">
                            {item.product_image && (
                              <Image
                                src={item.product_image}
                                alt={item.product_name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-dark text-sm line-clamp-1">{item.product_name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        {order.order_items.length > 4 && (
                          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3 min-w-[100px]">
                            <p className="text-sm text-gray-600">+{order.order_items.length - 4} more</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                          <p className="text-sm font-medium text-dark">{order.payment_method || 'N/A'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-6 py-2 bg-blue text-white rounded-lg font-medium hover:bg-blue-dark transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-dark">{selectedOrder.order_number}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order Status</p>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {selectedOrder.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold text-dark mb-3">Shipping Address</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-dark">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrder.shipping_address}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shipping_city}, {selectedOrder.shipping_country}</p>
                      {selectedOrder.customer_phone && (
                        <p className="text-sm text-gray-600 mt-2">Phone: {selectedOrder.customer_phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-dark mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                          {item.product_image && (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-dark">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                            <p className="font-semibold text-dark">${item.subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-dark mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping Fee</span>
                        <span>${selectedOrder.shipping_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-dark pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-blue">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-600 pt-2">
                        Payment Method: {selectedOrder.payment_method || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-semibold text-dark mb-3">Order Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
