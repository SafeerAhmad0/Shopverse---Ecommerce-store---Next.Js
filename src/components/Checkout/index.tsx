"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const shippingFee = 15.00;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + shippingFee;

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/signin');
        return;
      }

      setUser(session.user);

      // Load user data from users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (dbUser) {
        setUserData(dbUser);
      }

      setLoading(false);
    };

    loadUser();
  }, [supabase, router]);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Extract customer information
      const customerInfo = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company: formData.get('companyName') as string,
      };

      // Extract billing address
      const billingAddress = {
        address: formData.get('address') as string,
        address2: formData.get('address2') as string,
        city: formData.get('town') as string,
        country: formData.get('country') as string,
        postalCode: formData.get('postalCode') as string,
      };

      // Extract shipping address (could be same as billing)
      const shippingAddress = {
        address: formData.get('shipping_address') as string || billingAddress.address,
        address2: formData.get('shipping_address2') as string || billingAddress.address2,
        city: formData.get('shipping_city') as string || billingAddress.city,
        country: formData.get('shipping_country') as string || billingAddress.country,
        postalCode: formData.get('shipping_postalCode') as string || billingAddress.postalCode,
        method: formData.get('shipping_method') as string || 'Standard Shipping',
      };

      // Extract payment method
      const paymentMethod = formData.get('payment_method') as string || 'Cash on Delivery';

      // Extract notes
      const notes = formData.get('notes') as string;

      // Validate required fields
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !billingAddress.address || !billingAddress.city || !billingAddress.country) {
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          customerInfo,
          billingAddress,
          shippingAddress,
          cartItems: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            price: item.discountedPrice || item.price,
            quantity: item.quantity,
            image: item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0] || null,
            sku: null
          })),
          pricing: {
            subtotal,
            shippingFee,
            tax: 0,
            discount: 0,
            total
          },
          paymentMethod,
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Clear cart
      dispatch(removeAllItemsFromCart());

      // Show success message
      toast.success(`Order placed successfully! Order #${data.orderNumber}`);

      // Redirect to success page or order details
      router.push(`/order-success?orderNumber=${data.orderNumber}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Checkout"} pages={["checkout"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Breadcrumb title={"Checkout"} pages={["checkout"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-xl shadow-1 p-12 text-center">
              <h2 className="text-2xl font-semibold text-dark mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
              <Link
                href="/shop-with-sidebar"
                className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-lg ease-out duration-200 hover:bg-opacity-90"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleCheckout}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- billing details --> */}
                <Billing userData={userData} />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* Real cart items */}
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">
                            {item.title} x {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Subtotal */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Subtotal</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">${subtotal.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Shipping */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">${shippingFee.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          ${total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
