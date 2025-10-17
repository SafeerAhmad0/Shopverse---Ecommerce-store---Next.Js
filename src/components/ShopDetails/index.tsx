// /app/shop-details/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector, AppDispatch } from "@/redux/store";
import type { Product } from "@/types/product";
import { createClient } from "@/lib/supabase/client";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import toast from "react-hot-toast";
import ReviewForm from "../Reviews/ReviewForm";
import ReviewList from "../Reviews/ReviewList";

const ShopDetails: React.FC = () => {
  // normalize params (id may be string | string[] | undefined)
  const params = useParams() as { id?: string | string[] };
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id; // string | undefined

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();

  // optional: product stored in Redux when clicking grid item
  const productFromRedux = useAppSelector(
    (state: any) => state.productDetailsReducer?.value
  );
  const previewIndexFromRedux = useAppSelector(
    (state: any) => state.productDetailsReducer?.previewIndex
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState<number>(0);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeWood, setActiveWood] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"tabOne" | "tabTwo" | "tabThree">("tabOne");
  const [user, setUser] = useState<any>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);

  // Check if item is in cart or wishlist
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const itemId = product ? (typeof product.id === 'string' ? parseInt(product.id) : product.id) : null;
  const isInCart = product ? cartItems.some((cartItem) => cartItem.id === itemId || cartItem.id === product.id) : false;
  const isInWishlist = product ? wishlistItems.some((wishlistItem) => wishlistItem.id === itemId || wishlistItem.id === product.id) : false;

  // On mount or when id / redux changes: find the product from database
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const load = async () => {
      setLoading(true);

      // no id in url
      if (!idStr) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // 1) Try Redux first (for quick load if already in state)
      if (productFromRedux && String(productFromRedux.id) === String(idStr)) {
        if (!mounted) return;
        setProduct(productFromRedux);
        setPreviewImg(typeof previewIndexFromRedux === "number" ? previewIndexFromRedux : 0);

        setActiveColor(
          Array.isArray(productFromRedux.color) && productFromRedux.color.length
            ? productFromRedux.color[0]
            : null
        );

        setActiveWood(
          Array.isArray(productFromRedux.woodTypes) && productFromRedux.woodTypes.length
            ? productFromRedux.woodTypes[0]
            : null
        );

        setLoading(false);
        return;
      }

      // 2) Fetch from database - run both queries in Shopverse for speed
      try {
        console.log("Fetching product with ID:", idStr);

        // Run both queries in Shopverse (faster than sequential)
        const [productResult, categoriesResult] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .eq("id", idStr)
            .single(),
          supabase
            .from("categories")
            .select("id, name")
        ]);

        console.log("Product data:", productResult.data);
        console.log("Error:", productResult.error);

        if (productResult.error) {
          console.error("Supabase error:", productResult.error);
          if (!mounted) return;
          setProduct(null);
          setLoading(false);
          return;
        }

        const productData = productResult.data;

        if (productData && mounted) {
          // Get category name from Shopverse query result
          let categoryName = "Uncategorized";
          if (productData.category_id && categoriesResult.data) {
            const category = categoriesResult.data.find(cat => cat.id === productData.category_id);
            if (category) {
              categoryName = category.name;
            }
          }

          // Convert database product to Product type
          let imageArray: string[] = [];
          if (productData.images && productData.images.length > 0) {
            imageArray = productData.images;
          } else if (productData.image_url) {
            imageArray = [productData.image_url];
          }

          const convertedProduct: Product = {
            id: productData.id,
            title: productData.title,
            reviews: 15,
            category: categoryName,
            price: productData.price,
            discountedPrice: productData.price,
            color: productData.colors || [],
            woodTypes: productData.wood_types || [],
            description_en: productData.description_en,
            description_ar: productData.description_ar,
            stock: productData.stock,
            imgs: {
              thumbnails: imageArray,
              previews: imageArray,
            },
          };

          console.log("Converted product:", convertedProduct);
          setProduct(convertedProduct);
          setPreviewImg(0);

          setActiveColor(
            Array.isArray(convertedProduct.color) && convertedProduct.color.length
              ? convertedProduct.color[0]
              : null
          );

          setActiveWood(
            Array.isArray(convertedProduct.woodTypes) && convertedProduct.woodTypes.length
              ? convertedProduct.woodTypes[0]
              : null
          );

          setLoading(false);
          return;
        } else {
          console.log("No product data found");
          if (!mounted) return;
          setProduct(null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch product from database", err);
        if (!mounted) return;
        setProduct(null);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [idStr, productFromRedux, previewIndexFromRedux]);


  // Check user session
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  // Fetch review statistics
  const fetchReviewStats = async () => {
    if (!idStr) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("product_id", idStr)
      .eq("is_hidden", false);

    if (!error && data) {
      setTotalReviews(data.length);
      if (data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10); // Round to 1 decimal
      } else {
        setAverageRating(0);
      }
    }
  };

  useEffect(() => {
    fetchReviewStats();
  }, [idStr, activeTab]); // Re-fetch when activeTab changes (hack to refresh after review submission)

  // persist previewImg so refresh/back keeps preview
  useEffect(() => {
    try {
      localStorage.setItem("previewIndex", String(previewImg));
    } catch {}
  }, [previewImg]);

  const inc = () => setQuantity((q) => q + 1);
  const dec = () => setQuantity((q) => Math.max(1, q - 1));

  const handlePreviewSlider = (item: Product, i ) => openPreviewModal(item, 0);

  const handleAddToCart = async () => {
    if (!product) return;

    const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;

    dispatch(
      addItemToCart({
        ...product,
        id: productId,
        quantity: quantity,
      })
    );

    toast.success(`Added ${quantity} item(s) to cart`);

    // Sync to database if logged in
    if (user) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('user_carts')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity
          });

        if (error) {
          if (error.code === '23505') {
            const { data: existing } = await supabase
              .from('user_carts')
              .select('quantity')
              .eq('user_id', user.id)
              .eq('product_id', product.id)
              .single();

            if (existing) {
              await supabase
                .from('user_carts')
                .update({ quantity: existing.quantity + quantity })
                .eq('user_id', user.id)
                .eq('product_id', product.id);
            }
          }
        }
      } catch (error) {
        console.error('Error syncing to cart:', error);
      }
    }
  };

  const handleWishlist = async () => {
    if (!product) return;

    const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
    const supabase = createClient();

    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeItemFromWishlist(product.id));

      // Remove from database if user is logged in
      if (user) {
        try {
          const { error } = await supabase
            .from('user_wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', product.id);

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
      // Add to wishlist
      dispatch(
        addItemToWishlist({
          ...product,
          id: product.id,
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
              product_id: product.id
            });

          if (error) {
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

  if (!idStr) {
    return (
      <div className="max-w-[1170px] mx-auto p-6">
        <Breadcrumb title={"Shop Details"} pages={["shop details"]} />
        <p className="text-center py-12">No product id provided in URL.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <div className="bg-gray-2 py-17.5 lg:py-22.5 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
        <section className="overflow-hidden relative pb-20 pt-20 mt-20">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
              <div className="lg:max-w-[570px] w-full">
                <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 animate-pulse">
                  <div className="w-full h-[450px] bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="max-w-[539px] w-full animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3 mb-8"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1170px] mx-auto p-6">
        <Breadcrumb title={"Shop Details"} pages={["shop details"]} />
        <div className="text-center py-12">
          <p className="mb-4">Product not found in database.</p>
          <p className="text-sm text-gray-500 mb-4">Product ID: {idStr}</p>
          <button onClick={() => router.push("/shop")} className="text-blue underline">
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  // normalize arrays
  const colorsArr = Array.isArray(product.color) ? product.color : [];
  const woodTypes = Array.isArray(product.woodTypes) ? product.woodTypes : [];

  return (
    <>
      <Breadcrumb title={product.title || "Shop Details"} pages={["shop details"]} />

      <section className="overflow-hidden relative pb-20 pt-20 mt-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative">
                <button
                  onClick={() => handlePreviewSlider(product, 1)}
                  aria-label="button for zoom"
                  className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                      fill=""
                    />
                  </svg>
                </button>

                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={product.imgs?.previews?.[previewImg] ?? "/images/placeholder.png"}
                    alt={product.title}
                    width={500}
                    height={500}
                    className="object-contain max-h-[450px]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {product.imgs?.thumbnails?.map((thumb, key) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                      key === previewImg ? "border-blue" : "border-transparent"
                    }`}
                  >
                    <Image width={50} height={50} src={thumb} alt={`thumb-${key}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-[539px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title}
                </h2>

                <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                  {product.discountedPrice && product.discountedPrice < product.price
                    ? `${Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF`
                    : "Sale"}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5"
                        fill={i < Math.floor(averageRating) ? "#FBBF24" : "none"}
                        stroke={i < Math.floor(averageRating) ? "#FBBF24" : "#D1D5DB"}
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium text-dark">
                    {averageRating > 0 ? `${averageRating} stars` : "No ratings yet"}
                    {totalReviews > 0 && ` (${totalReviews})`}
                  </span>
                </div>
              </div>

              <h3 className="font-medium text-custom-1 mb-4.5">
                <span className="text-sm sm:text-base text-dark">
                  Price: ${product.discountedPrice ?? product.price}
                </span>
                {product.discountedPrice && <span className="line-through ml-3">${product.price}</span>}
              </h3>

              <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z"
                          fill="#573621"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z"
                          fill="#573621"
                        />
                      </svg>
                      Free delivery available
                    </li>

                    <li className="flex items-center gap-2.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3589 8.35863C13.603 8.11455 13.603 7.71882 13.3589 7.47475C13.1149 7.23067 12.7191 7.23067 12.4751 7.47475L8.75033 11.1995L7.5256 9.97474C7.28152 9.73067 6.8858 9.73067 6.64172 9.97474C6.39764 10.2188 6.39764 10.6146 6.64172 10.8586L8.30838 12.5253C8.55246 12.7694 8.94819 12.7694 9.19227 12.5253L13.3589 8.35863Z"
                          fill="#573621"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.0003 1.04169C5.05277 1.04169 1.04199 5.05247 1.04199 10C1.04199 14.9476 5.05277 18.9584 10.0003 18.9584C14.9479 18.9584 18.9587 14.9476 18.9587 10C18.9587 5.05247 14.9479 1.04169 10.0003 1.04169ZM2.29199 10C2.29199 5.74283 5.74313 2.29169 10.0003 2.29169C14.2575 2.29169 17.7087 5.74283 17.7087 10C17.7087 14.2572 14.2575 17.7084 10.0003 17.7084C5.74313 17.7084 2.29199 14.2572 2.29199 10Z"
                          fill="#573621"
                        />
                      </svg>
                      Sales 30% Off Use Code: PROMO30
                    </li>
              </ul>

              {colorsArr.length > 0 && (
                <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                      {/* <!-- details item --> */}
                      <div className="flex items-center gap-4">
                        <div className="min-w-[90px]">
                          <h4 className="font-medium text-dark">Color:</h4>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                        {colorsArr.map((c, idx) => (
                            <label
                              key={idx}
                              htmlFor={`color-${idx}`}
                              className="cursor-pointer select-none flex items-center"
                            >
                            <div className="relative">
                                <input
                                  type="radio"
                                  name="color"
                                  id={`color-${idx}`}
                                  className="sr-only"
                                  onChange={() => setActiveColor(c)}
                                  checked={activeColor === c}
                                />
                            <div
                              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                                activeColor === c
                                  ? "border-blue shadow-md scale-110"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <span
                                    className="block w-7 h-7 rounded-full shadow-inner"
                                    style={{ backgroundColor: `${c}` }}
                                    title={c}
                                  ></span>
                                  </div>
                                  </div>
                          </label>
                        ))}
                        </div>
                      </div>

                      {/* Wood types */}
                      {woodTypes.length > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="min-w-[90px]">
                            <h4 className="font-medium text-dark">Wood Type:</h4>
                          </div>
                          <div className="flex gap-2.5 flex-wrap">
                            {woodTypes.map((w, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveWood(w)}
                                className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all
                                  ${activeWood === w
                                    ? "bg-blue text-white border-blue shadow-md scale-105"
                                    : "bg-white text-dark border-gray-300 hover:border-blue hover:shadow"}`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                </div>
              )}

              <div className="flex flex-wrap items-center gap-4.5">
                      <div className="flex items-center rounded-md border border-gray-3">
                        <button
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z"
                              fill=""
                            />
                          </svg>
                        </button>

                        <span className="flex items-center justify-center w-16 h-12 border-x border-gray-4">
                          {quantity}
                        </span>

                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          aria-label="button for add product"
                          className="flex items-center justify-center w-12 h-12 ease-out duration-200 hover:text-blue"
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z"
                              fill=""
                            />
                            <path
                              d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>

                      {/* <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isInCart ? 'Add More to Cart' : 'Add to Cart'}
                      </button> */}

                      <button
                        onClick={async () => {
                          if (!product) return;

                          // Add to cart first
                          await handleAddToCart();

                          // Then redirect to checkout
                          router.push('/checkout');
                        }}
                        disabled={product.stock === 0}
                        className="inline-flex font-medium text-white py-3 px-7 rounded-md ease-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#10B981" }}
                      >
                        Purchase Now
                      </button>

                      <button
                        onClick={handleWishlist}
                        className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-3 ease-out duration-200 hover:border-transparent"
                        style={{
                          backgroundColor: isInWishlist ? '#DC2626' : 'white',
                          color: isInWishlist ? 'white' : 'inherit'
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                            fill={isInWishlist ? "white" : "#000000"}
                          />
                        </svg>
                      </button>
                    </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {[
              { id: "tabOne", title: "Description" },
              { id: "tabTwo", title: "Additional Information" },
              { id: "tabThree", title: "Reviews" },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`font-medium lg:text-lg ${activeTab === t.id ? "text-blue" : "text-dark"}`}>
                {t.title}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "tabOne" ? (
              <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                <h2 className="font-medium text-2xl text-dark mb-7">Product Description:</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1 w-1/3">Product Name</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">{product.title}</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Category</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">{product.category || 'Uncategorized'}</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Price</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">${product.price}</td>
                      </tr>
                      {product.discountedPrice && product.discountedPrice < product.price && (
                        <tr className="border-b border-gray-3">
                          <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Sale Price</td>
                          <td className="py-4 px-4 sm:px-5 text-dark text-green-600 font-semibold">${product.discountedPrice}</td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Stock Status</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">
                          {product.stock > 0 ? (
                            <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                          ) : (
                            <span className="text-red font-medium">Out of Stock</span>
                          )}
                        </td>
                      </tr>
                      {colorsArr.length > 0 && (
                        <tr className="border-b border-gray-3">
                          <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Available Colors</td>
                          <td className="py-4 px-4 sm:px-5 text-dark">{colorsArr.join(', ')}</td>
                        </tr>
                      )}
                      {woodTypes.length > 0 && (
                        <tr className="border-b border-gray-3">
                          <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Wood Types</td>
                          <td className="py-4 px-4 sm:px-5 text-dark">{woodTypes.join(', ')}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Description</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">{product.description_en || 'No description available'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === "tabTwo" ? (
              <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                <h2 className="font-medium text-2xl text-dark mb-7">Additional Information:</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1 w-1/3">Weight</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">N/A</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Dimensions</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">N/A</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Material</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">{woodTypes.length > 0 ? woodTypes[0] : 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Color Options</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">{colorsArr.length > 0 ? colorsArr.length + ' options' : 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-3">
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Care Instructions</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">Clean with a soft, dry cloth</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 sm:px-5 font-medium text-dark bg-gray-1">Warranty</td>
                        <td className="py-4 px-4 sm:px-5 text-dark">1 Year Manufacturer Warranty</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
                <h2 className="font-medium text-2xl text-dark mb-7">Customer Reviews:</h2>

                {/* Review Form - Only show if user is logged in */}
                {user && idStr && (
                  <div className="mb-8">
                    <ReviewForm
                      productId={idStr}
                      userId={user.id}
                      onReviewSubmitted={() => {
                        // Trigger review stats refresh
                        fetchReviewStats();
                      }}
                    />
                  </div>
                )}

                {!user && (
                  <div className="bg-gray-50 rounded-xl p-6 border-2 mb-8" style={{ borderColor: "#E5E7EB" }}>
                    <p className="text-center" style={{ color: "#64748B" }}>
                      Please{" "}
                      <button
                        onClick={() => router.push("/signin")}
                        className="text-blue font-semibold underline"
                      >
                        sign in
                      </button>{" "}
                      to write a review
                    </p>
                  </div>
                )}

                {/* Review List */}
                {idStr && <ReviewList productId={idStr} />}
              </div>
            )}
          </div>
        </div>
      </section>

      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;
