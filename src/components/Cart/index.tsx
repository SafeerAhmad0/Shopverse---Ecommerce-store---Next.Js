"use client";
import React, { useEffect, useState } from "react";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { addItemToCart, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import SingleItem from "./SingleItem";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const Cart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Check authentication and load cart from database
  useEffect(() => {
    const loadUserAndCart = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          // Load cart from database for logged-in users
          const { data: cartData, error } = await supabase
            .from('user_carts')
            .select(`
              id,
              quantity,
              products (
                id,
                title,
                price,
                images,
                image_url
              )
            `)
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error loading cart:', error);
          } else if (cartData && cartData.length > 0) {
            // Clear Redux cart first
            dispatch(removeAllItemsFromCart());

            // Load database cart into Redux
            cartData.forEach((item: any) => {
              if (item.products) {
                dispatch(addItemToCart({
                  id: item.products.id,
                  title: item.products.title,
                  price: item.products.price,
                  discountedPrice: item.products.price,
                  quantity: item.quantity,
                  imgs: {
                    thumbnails: item.products.images || [item.products.image_url],
                    previews: item.products.images || [item.products.image_url]
                  }
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error in loadUserAndCart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserAndCart();
      } else {
        // Clear cart when user logs out
        dispatch(removeAllItemsFromCart());
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleClearCart = async () => {
    if (!user) {
      dispatch(removeAllItemsFromCart());
      toast.success('Cart cleared');
      return;
    }

    try {
      // Clear cart in database
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear Redux cart
      dispatch(removeAllItemsFromCart());
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error('Failed to clear cart');
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Cart"} pages={["Cart"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your cart...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb title={"Cart"} pages={["Cart"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-xl shadow-1 p-12 text-center">
              <svg
                className="mx-auto mb-6"
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="50" fill="#EFF6FF" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M50 30C41.7157 30 35 36.7157 35 45C35 53.2843 41.7157 60 50 60C58.2843 60 65 53.2843 65 45C65 36.7157 58.2843 30 50 30ZM40 45C40 39.4772 44.4772 35 50 35C55.5228 35 60 39.4772 60 45C60 50.5228 55.5228 55 50 55C44.4772 55 40 50.5228 40 45Z"
                  fill="#3B82F6"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M50 60C42.0294 60 34.8397 62.9394 30 67.9091V70H70V67.9091C65.1603 62.9394 57.9706 60 50 60ZM35 67.5C38.7346 64.2213 44.0736 62.5 50 62.5C55.9264 62.5 61.2654 64.2213 65 67.5H35Z"
                  fill="#3B82F6"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-dark mb-3">Please Sign In</h2>
              <p className="text-gray-600 mb-6">You need to sign in to view your cart and save items.</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/signin"
                  className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-lg ease-out duration-200 hover:bg-opacity-90"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex justify-center font-medium text-blue bg-gray-1 py-3 px-8 rounded-lg ease-out duration-200 hover:bg-gray-2"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Cart"} pages={["Cart"]} />
      {cartItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Your Cart</h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Shopping Cart
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* table header */}
                  <div className="flex items-center py-5.5 px-7.5">
                    <div className="min-w-[400px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[180px]">
                      <p className="text-dark">Price</p>
                    </div>

                    <div className="min-w-[275px]">
                      <p className="text-dark">Quantity</p>
                    </div>

                    <div className="min-w-[200px]">
                      <p className="text-dark">Subtotal</p>
                    </div>

                    <div className="min-w-[50px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* cart items */}
                  {cartItems.map((item, key) => (
                    <SingleItem item={item} key={key} userId={user.id} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 mt-9">
              <Discount />
              <OrderSummary />
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center bg-white rounded-xl shadow-1 p-12">
              <div className="mx-auto pb-7.5">
                <svg
                  className="mx-auto"
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M36.1693 36.2421C35.6126 36.0565 35.0109 36.3574 34.8253 36.9141C34.6398 37.4707 34.9406 38.0725 35.4973 38.258L35.8726 38.3831C36.8308 38.7025 37.4644 38.9154 37.9311 39.1325C38.373 39.3381 38.5641 39.5036 38.6865 39.6734C38.809 39.8433 38.9055 40.0769 38.9608 40.5612C39.0192 41.0726 39.0208 41.7409 39.0208 42.751L39.0208 46.5361C39.0208 48.4735 39.0207 50.0352 39.1859 51.2634C39.3573 52.5385 39.7241 53.6122 40.5768 54.4649C41.4295 55.3176 42.5032 55.6844 43.7783 55.8558C45.0065 56.0209 46.5681 56.0209 48.5055 56.0209H59.9166C60.5034 56.0209 60.9791 55.5452 60.9791 54.9584C60.9791 54.3716 60.5034 53.8959 59.9166 53.8959H48.5833C46.5498 53.8959 45.1315 53.8936 44.0615 53.7498C43.022 53.61 42.4715 53.3544 42.0794 52.9623C41.9424 52.8253 41.8221 52.669 41.7175 52.4792H55.7495C56.3846 52.4792 56.9433 52.4793 57.4072 52.4292C57.9093 52.375 58.3957 52.2546 58.8534 51.9528C59.3111 51.651 59.6135 51.2513 59.8611 50.8111C60.0898 50.4045 60.3099 49.891 60.56 49.3072L61.2214 47.7641C61.766 46.4933 62.2217 45.4302 62.4498 44.5655C62.6878 43.6634 62.7497 42.7216 62.1884 41.8704C61.627 41.0191 60.737 40.705 59.8141 40.5684C58.9295 40.4374 57.7729 40.4375 56.3903 40.4375L41.0845 40.4375C41.0806 40.3979 41.0765 40.3588 41.0721 40.3201C40.9937 39.6333 40.8228 39.0031 40.4104 38.4309C39.998 37.8588 39.4542 37.4974 38.8274 37.2058C38.2377 36.9315 37.4879 36.6816 36.6005 36.3858L36.1693 36.2421ZM41.1458 42.5625C41.1458 42.6054 41.1458 42.6485 41.1458 42.692L41.1458 46.4584C41.1458 48.1187 41.1473 49.3688 41.2262 50.3542H55.6975C56.4 50.3542 56.8429 50.3528 57.1791 50.3165C57.4896 50.2829 57.6091 50.2279 57.6836 50.1787C57.7582 50.1296 57.8559 50.0415 58.009 49.7692C58.1748 49.4745 58.3506 49.068 58.6273 48.4223L59.2344 47.0057C59.8217 45.6355 60.2119 44.7177 60.3951 44.0235C60.5731 43.3488 60.4829 43.1441 60.4143 43.0401C60.3458 42.9362 60.1931 42.7727 59.5029 42.6705C58.7927 42.5653 57.7954 42.5625 56.3047 42.5625H41.1458Z"
                    fill="#8D93A5"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M40.4375 60.625C40.4375 62.3855 41.8646 63.8125 43.625 63.8125C45.3854 63.8125 46.8125 62.3855 46.8125 60.625C46.8125 58.8646 45.3854 57.4375 43.625 57.4375C41.8646 57.4375 40.4375 58.8646 40.4375 60.625ZM43.625 61.6875C43.0382 61.6875 42.5625 61.2118 42.5625 60.625C42.5625 60.0382 43.0382 59.5625 43.625 59.5625C44.2118 59.5625 44.6875 60.0382 44.6875 60.625C44.6875 61.2118 44.2118 61.6875 43.625 61.6875Z"
                    fill="#8D93A5"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M56.375 63.8126C54.6146 63.8126 53.1875 62.3856 53.1875 60.6251C53.1875 58.8647 54.6146 57.4376 56.375 57.4376C58.1354 57.4376 59.5625 58.8647 59.5625 60.6251C59.5625 62.3856 58.1354 63.8126 56.375 63.8126ZM55.3125 60.6251C55.3125 61.212 55.7882 61.6876 56.375 61.6876C56.9618 61.6876 57.4375 61.212 57.4375 60.6251C57.4375 60.0383 56.9618 59.5626 56.375 59.5626C55.7882 59.5626 55.3125 60.0383 55.3125 60.6251Z"
                    fill="#8D93A5"
                  />
                </svg>
              </div>

              <p className="pb-6 text-gray-600">Your cart is empty!</p>

              <Link
                href="/shop-with-sidebar"
                className="inline-flex justify-center font-medium text-white bg-dark py-3 px-8 rounded-lg ease-out duration-200 hover:bg-opacity-95"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Cart;
