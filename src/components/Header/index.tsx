"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import Dropdown from "./Dropdown";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";
import {
  selectTotalPrice,
  addItemToCart,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";
import {
  addItemToWishlist,
  removeAllItemsFromWishlist,
} from "@/redux/features/wishlist-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Header = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const { openCartModal } = useCartModalContext();
  const supabase = createClient();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const product = useAppSelector((state) => state.cartReducer.items);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  const handleOpenCartModal = () => {
    openCartModal();
  };

  // Check user authentication status AND load cart/wishlist from database
  useEffect(() => {
    const loadUserDataFromDB = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        // Load cart from database
        const { data: cartData } = await supabase
          .from("user_carts")
          .select(
            `
            id, quantity,
            products (id, title, price, images, image_url)
          `
          )
          .eq("user_id", session.user.id);

        if (cartData && cartData.length > 0) {
          dispatch(removeAllItemsFromCart());
          cartData.forEach((item: any) => {
            if (item.products) {
              dispatch(
                addItemToCart({
                  id: item.products.id,
                  title: item.products.title,
                  price: item.products.price,
                  discountedPrice: item.products.price,
                  quantity: item.quantity,
                  imgs: {
                    thumbnails: item.products.images || [
                      item.products.image_url,
                    ],
                    previews: item.products.images || [item.products.image_url],
                  },
                })
              );
            }
          });
        }

        // Load wishlist from database
        const { data: wishlistData } = await supabase
          .from("user_wishlists")
          .select(
            `
            id,
            products (id, title, price, images, image_url)
          `
          )
          .eq("user_id", session.user.id);

        if (wishlistData && wishlistData.length > 0) {
          dispatch(removeAllItemsFromWishlist());
          wishlistData.forEach((item: any) => {
            if (item.products) {
              dispatch(
                addItemToWishlist({
                  id: item.products.id,
                  title: item.products.title,
                  price: item.products.price,
                  discountedPrice: item.products.price,
                  quantity: 1,
                  imgs: {
                    thumbnails: item.products.images || [
                      item.products.image_url,
                    ],
                    previews: item.products.images || [item.products.image_url],
                  },
                })
              );
            }
          });
        }
      }
    };

    loadUserDataFromDB();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserDataFromDB();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, dispatch]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (data) {
        const categoryOptions = [
          { label: "All Categories", value: "all" },
          ...data.map((cat) => ({
            label: cat.name,
            value: cat.id,
          })),
        ];
        setCategories(categoryOptions);
      }
    };

    fetchCategories();
  }, []);

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
  });

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length > 0) {
        let categoryId = null;
        if (selectedCategory && selectedCategory !== "all") {
          const category = categories.find(
            (cat) => cat.label === selectedCategory
          );
          if (category && category.value !== "all") {
            categoryId = category.value;
          }
        }

        let query = supabase
          .from("products")
          .select("id, title, price, image_url, images, category_id")
          .or(
            `title.ilike.%${searchQuery}%,description_en.ilike.%${searchQuery}%`
          );

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data } = await query.limit(5);

        setSearchResults(data || []);
        setShowSearchDropdown(true);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };

    const debounce = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Successfully signed out");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={`fixed left-0 top-0 w-full z-9999 transition-all duration-500 ${
        stickyMenu
          ? "bg-white/95 backdrop-blur-xl shadow-2xl shadow-primary-100/20 py-2"
          : "bg-white/90 backdrop-blur-lg py-3"
      }`}
    >
      {/* Main Navigation - NEAT & CLEAN */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between gap-6">
          {/* NEAT LOGO - Shopverse */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SHOPVERSE
              </span>
              <span className="text-[9px] text-gray-500 font-semibold tracking-wider -mt-0.5">PREMIUM SHOPPING</span>
            </div>
          </Link>

          {/* Mega Search Bar */}
          <div className="flex-1 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative"
            >
              <div className="flex items-center bg-gradient-to-r from-gray-50 to-white rounded-full shadow-lg border border-primary-100 focus-within:border-primary-400 focus-within:shadow-xl focus-within:shadow-primary-200/50 transition-all duration-300">
                <div className="px-3 border-r border-primary-100">
                  <CustomSelect
                    options={
                      categories.length > 0
                        ? categories
                        : [{ label: "All Categories", value: "all" }]
                    }
                    onCategorySelect={(option) => {
                      setSelectedCategory(
                        option.value === "all" ? null : option.label
                      );
                      const event = new CustomEvent("categoryFilter", {
                        detail: {
                          category: option.value === "all" ? null : option.label,
                        },
                      });
                      window.dispatchEvent(event);
                    }}
                  />
                </div>

                <div ref={searchRef} className="flex-1 relative">
                  <input
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    type="search"
                    name="search"
                    id="search"
                    placeholder="Search for premium furniture..."
                    autoComplete="off"
                    className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 px-4 py-2.5 text-sm"
                  />

                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-primary-300/50 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>

                  {/* Beautiful Search Results */}
                  {showSearchDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-primary-100 max-h-96 overflow-y-auto"
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/shop-details/${product.id}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 border-b border-gray-100 last:border-b-0 group"
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                              {product.images?.[0] || product.image_url ? (
                                <Image
                                  src={product.images?.[0] || product.image_url}
                                  alt={product.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{product.title}</p>
                              <p className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                ${product.price}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No products found</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 transition-all duration-300 border border-primary-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-[10px] text-gray-500 font-medium">Welcome back</p>
                    <p className="text-xs font-bold text-gray-900">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-primary-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-primary-100 py-2 overflow-hidden"
                  >
                    <Link
                      href="/my-account"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700 group-hover:text-primary-600">My Account</span>
                    </Link>
                    <Link
                      href="/my-orders"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700 group-hover:text-primary-600">My Orders</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-gray-700 group-hover:text-primary-600">My Wishlist</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-all group text-left"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-red-600 group-hover:text-red-700">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold hover:shadow-xl hover:shadow-primary-300/50 hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Sign In
              </Link>
            )}

            <LanguageSelector />

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-full bg-gradient-to-br from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={handleOpenCartModal}
              className="relative p-2 rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-primary-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {product.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {product.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center gap-6 mt-3 pb-3">
          <Link href="/" className="text-gray-700 hover:text-primary-600 text-sm font-semibold transition-colors relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/shop-with-sidebar" className="text-gray-700 hover:text-primary-600 text-sm font-semibold transition-colors relative group">
            Shop
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary-600 text-sm font-semibold transition-colors relative group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/my-orders" className="text-gray-700 hover:text-primary-600 text-sm font-semibold transition-colors relative group">
            Track Order
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
