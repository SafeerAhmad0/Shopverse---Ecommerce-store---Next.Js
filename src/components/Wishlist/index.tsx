"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { addItemToWishlist, removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Check authentication and load wishlist from database
  useEffect(() => {
    const loadUserAndWishlist = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          // Load wishlist from database for logged-in users
          const { data: wishlistData, error } = await supabase
            .from('user_wishlists')
            .select(`
              id,
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
            console.error('Error loading wishlist:', error);
          } else if (wishlistData && wishlistData.length > 0) {
            // Clear Redux wishlist first
            dispatch(removeAllItemsFromWishlist());

            // Load database wishlist into Redux
            wishlistData.forEach((item: any) => {
              if (item.products) {
                dispatch(addItemToWishlist({
                  id: item.products.id,
                  title: item.products.title,
                  price: item.products.price,
                  discountedPrice: item.products.price,
                  quantity: 1,
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
        console.error('Error in loadUserAndWishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndWishlist();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserAndWishlist();
      } else {
        // Clear wishlist when user logs out
        dispatch(removeAllItemsFromWishlist());
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleClearWishlist = async () => {
    if (!user) {
      dispatch(removeAllItemsFromWishlist());
      toast.success('Wishlist cleared');
      return;
    }

    try {
      // Clear wishlist in database
      const { error } = await supabase
        .from('user_wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear Redux wishlist
      dispatch(removeAllItemsFromWishlist());
      toast.success('Wishlist cleared');
    } catch (error: any) {
      toast.error('Failed to clear wishlist');
      console.error('Error clearing wishlist:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
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
              <p className="text-gray-600 mb-6">You need to sign in to view your wishlist and save items.</p>
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
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      {wishlistItems.length > 0 ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
              <button
                onClick={handleClearWishlist}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Wishlist
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* table header */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Unit Price</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Stock Status</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Action</p>
                    </div>
                  </div>

                  {/* wishlist items */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} userId={user.id} />
                  ))}
                </div>
              </div>
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
                  <circle cx="50" cy="50" r="50" fill="#FEE2E2" />
                  <path
                    d="M50 35C41.7157 35 35 41.7157 35 50C35 58.2843 41.7157 65 50 65C58.2843 65 65 58.2843 65 50C65 41.7157 58.2843 35 50 35ZM44 47C43.4477 47 43 46.5523 43 46C43 45.4477 43.4477 45 44 45C44.5523 45 45 45.4477 45 46C45 46.5523 44.5523 47 44 47ZM56 47C55.4477 47 55 46.5523 55 46C55 45.4477 55.4477 45 56 45C56.5523 45 57 45.4477 57 46C57 46.5523 56.5523 47 56 47ZM42.5 53C42.5 52.4477 42.9477 52 43.5 52H56.5C57.0523 52 57.5 52.4477 57.5 53C57.5 53.5523 57.0523 54 56.5 54H43.5C42.9477 54 42.5 53.5523 42.5 53Z"
                    fill="#DC2626"
                  />
                </svg>
              </div>

              <p className="pb-6 text-gray-600">Your wishlist is empty!</p>

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
