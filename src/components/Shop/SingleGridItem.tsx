"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, [supabase]);

  // Check if item is in cart
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
  // Compare both string and number versions to handle both UUID and integer IDs
  const isInCart = cartItems.some((cartItem) => cartItem.id === itemId || cartItem.id === item.id);

  // Check if item is in wishlist
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((wishlistItem) => wishlistItem.id === itemId || wishlistItem.id === item.id);

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleOpenDetails = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = async () => {
    dispatch(
      addItemToCart({
        ...item,
        id: itemId,
        quantity: 1,
      })
    );

    // Sync to database if user is logged in
    if (user) {
      try {
        // Use the original item.id as is - don't convert
        const productId = item.id;

        console.log('Adding to cart - Product ID:', productId, 'Type:', typeof productId);

        const { error } = await supabase
          .from('user_carts')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });

        if (error) {
          // If already exists, increment quantity
          if (error.code === '23505') {
            const { data: existing } = await supabase
              .from('user_carts')
              .select('quantity')
              .eq('user_id', user.id)
              .eq('product_id', productId)
              .single();

            if (existing) {
              await supabase
                .from('user_carts')
                .update({ quantity: existing.quantity + 1 })
                .eq('user_id', user.id)
                .eq('product_id', productId);
            }
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const handleItemToWishList = async () => {
    // Use the original item.id as is
    const productId = item.id;

    console.log('Wishlist operation - Product ID:', productId, 'Type:', typeof productId);

    if (isInWishlist) {
      // Remove from wishlist - use original item.id to match what's in Redux
      dispatch(removeItemFromWishlist(item.id));

      // Remove from database if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('user_wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) throw error;
          toast.success('Removed from wishlist');
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          toast.error('Failed to remove from wishlist');
        }
      } else {
        toast.success('Removed from wishlist');
      }
    } else {
      // Add to wishlist - use original item.id to match removal
      dispatch(
        addItemToWishlist({
          ...item,
          id: item.id,
          status: "available",
          quantity: 1,
        })
      );

      // Add to database if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('user_wishlists')
            .insert({
              user_id: user.id,
              product_id: productId
            });

          if (error) {
            // If already exists (duplicate), just ignore
            if (error.code === '23505') {
              toast.success('Already in wishlist');
            } else {
              throw error;
            }
          } else {
            toast.success('Added to wishlist');
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          toast.error('Failed to add to wishlist');
        }
      } else {
        toast.success('Added to wishlist');
      }
    }
  };

  return (
    <div
      id={`product-${item.id}`}
      className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden p-4">
        <div
          onClick={() => {
            handleOpenDetails();
            router.push(`/shop-details/${item.id}`);
          }}
          className="relative w-full h-full transition-transform duration-500 cursor-pointer"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        >
          {item.imgs.previews[0] ? (
            <Image
              src={item.imgs.previews[0]}
              alt={item.title}
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {item.category && (
          <div className="absolute top-2 left-2 bg-blue text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
            {item.category}
          </div>
        )}

        {item.stock < 10 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            {item.stock === 0 ? 'Out of Stock' : `Only ${item.stock} left`}
          </div>
        )}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            aria-label="button for quick view"
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z" fill="" />
              <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z" fill="" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (isInCart) {
                router.push('/checkout');
              } else {
                handleAddToCart();
              }
            }}
            disabled={item.stock === 0}
            className="inline-flex items-center justify-center font-medium text-custom-sm py-2.5 px-6 rounded-full bg-blue text-white ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px]"
          >
            {item.stock === 0 ? t('Out of Stock') : isInCart ? t('Checkout') : t('Add to Cart')}
          </button>

          <button
            onClick={() => handleItemToWishList()}
            aria-label="button for favorite select"
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-1 ease-out duration-200 bg-white hover:text-red-500"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                fill={isInWishlist ? "#DC2626" : "#000000"}
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors"
          style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s" }}
        >
          <Link href={`/shop-details/${item.id}`} onClick={handleOpenDetails}>
            {item.title}
          </Link>
        </h3>

        <div
          className="flex items-center mb-2"
          style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s 0.1s" }}
        >
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">({item.reviews || 32})</span>
        </div>

        <p
          className="text-sm text-gray-600 mb-3 font-light leading-relaxed line-clamp-2"
          style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s 0.2s" }}
        >
          {item.description_en || "High-quality product"}
        </p>

        <div
          className="flex items-center justify-between"
          style={{ transform: isHovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s 0.3s" }}
        >
          <span className="text-xl font-light text-gray-900">${item.price}</span>
        </div>
      </div>
    </div>
  );
};

export default SingleGridItem;
