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
      // Note: Removed the cart/wishlist clearing on logout - cookies will handle guest state
    };

    loadUserDataFromDB();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadUserDataFromDB();
      }
      // Note: Removed the cart/wishlist clearing on logout - cookies will handle guest state
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
        // If a category is selected, first find the category ID
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

        // Apply category filter if a category is selected
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
    <header
      className={`fixed left-0 top-0 w-full z-9999 bg-white transition-all ease-in-out duration-300 ${
        stickyMenu && "shadow"
      }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        {/* <!-- header top start --> */}
        <div
          className={`flex items-center gap-5 ease-out duration-200 ${
            stickyMenu ? "py-4" : "py-6"
          }`}
        >
          {/* Logo */}
          <Link className="flex-shrink-0" href="/">
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </Link>

          {/* Search section - takes all available space */}
          <div className="flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(
                      searchQuery
                    )}`;
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Categories dropdown - separate and rounded */}
                  <div className="flex-none bg-white rounded-full border border-gray-200 px-5 py-2.5">
                    <CustomSelect
                      options={
                        categories.length > 0
                          ? categories
                          : [{ label: "All Categories", value: "all" }]
                      }
                      onCategorySelect={(option) => {
                        console.log("Category selected:", option);

                        // Update selected category for search filtering
                        setSelectedCategory(
                          option.value === "all" ? null : option.label
                        );

                        // Trigger custom event to filter products on current page
                        const event = new CustomEvent("categoryFilter", {
                          detail: {
                            category:
                              option.value === "all" ? null : option.label,
                          },
                        });
                        console.log("Dispatching event:", event.detail);
                        window.dispatchEvent(event);
                      }}
                    />
                  </div>

                  {/* Search bar - separate and rounded */}
                  <div
                    ref={searchRef}
                    className="relative flex-1 bg-white rounded-full border border-gray-200 px-5 py-2.5"
                  >
                    <input
                      onChange={(e) => setSearchQuery(e.target.value)}
                      value={searchQuery}
                      type="search"
                      name="search"
                      id="search"
                      placeholder={t("Search products...")}
                      autoComplete="off"
                      className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 pr-8"
                    />
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Search Results Dropdown */}
                    {showSearchDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                        {searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/shop-details/${product.id}`}
                              onClick={(e) => {
                                setShowSearchDropdown(false);
                                setSearchQuery("");
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-left"
                            >
                              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                {product.images?.[0] || product.image_url ? (
                                  <Image
                                    src={
                                      product.images?.[0] || product.image_url
                                    }
                                    alt={product.title}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      className="w-6 h-6 text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.title}
                                </p>
                                <p className="text-sm text-blue font-semibold">
                                  ${product.price}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <p>{t("No products available")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </form>
          </div>

          {/* <!-- header top right --> */}
          <div className="flex flex-shrink-0 items-center gap-5">
            {/* <div className="hidden xl:flex items-center gap-3.5"> */}
            {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.7177 3.09215C5.94388 1.80121 7.9721 2.04307 8.98569 3.47665L10.2467 5.26014C11.0574 6.4068 10.9889 8.00097 10.0214 9.01965L9.7765 9.27743C9.77582 9.27921 9.7751 9.28115 9.77436 9.28323C9.76142 9.31959 9.7287 9.43538 9.7609 9.65513C9.82765 10.1107 10.1793 11.0364 11.607 12.5394C13.0391 14.0472 13.9078 14.4025 14.3103 14.4679C14.484 14.4961 14.5748 14.4716 14.6038 14.4614L15.0124 14.0312C15.8862 13.1113 17.2485 12.9301 18.347 13.5623L20.2575 14.662C21.8904 15.6019 22.2705 17.9011 20.9655 19.275L19.545 20.7705C19.1016 21.2373 18.497 21.6358 17.75 21.7095C15.9261 21.8895 11.701 21.655 7.27161 16.9917C3.13844 12.6403 2.35326 8.85538 2.25401 7.00615L2.92011 6.9704L2.25401 7.00615C2.20497 6.09248 2.61224 5.30879 3.1481 4.74464L4.7177 3.09215ZM7.7609 4.34262C7.24855 3.61797 6.32812 3.57473 5.80528 4.12518L4.23568 5.77767C3.90429 6.12656 3.73042 6.52646 3.75185 6.92576C3.83289 8.43558 4.48307 11.8779 8.35919 15.9587C12.4234 20.2375 16.1676 20.3584 17.6026 20.2167C17.8864 20.1887 18.1783 20.0313 18.4574 19.7375L19.8779 18.2419C20.4907 17.5968 20.3301 16.4345 19.5092 15.962L17.5987 14.8624C17.086 14.5673 16.4854 14.6584 16.1 15.0642L15.6445 15.5437L15.1174 15.043C15.6445 15.5438 15.6438 15.5445 15.6432 15.5452L15.6417 15.5467L15.6388 15.5498L15.6324 15.5562L15.6181 15.5704C15.6078 15.5803 15.5959 15.5913 15.5825 15.6031C15.5556 15.6266 15.5223 15.6535 15.4824 15.6819C15.4022 15.7387 15.2955 15.8012 15.1606 15.8544C14.8846 15.9633 14.5201 16.0216 14.0699 15.9485C13.1923 15.806 12.0422 15.1757 10.5194 13.5724C8.99202 11.9644 8.40746 10.7647 8.27675 9.87259C8.21022 9.41852 8.26346 9.05492 8.36116 8.78035C8.40921 8.64533 8.46594 8.53766 8.51826 8.4559C8.54435 8.41514 8.56922 8.381 8.5912 8.35322C8.60219 8.33933 8.61246 8.32703 8.62182 8.31627L8.63514 8.30129L8.64125 8.29465L8.64415 8.29154L8.64556 8.29004C8.64625 8.28931 8.64694 8.28859 9.17861 8.79357L8.64695 8.28858L8.93376 7.98662C9.3793 7.51755 9.44403 6.72317 9.02189 6.1261L7.7609 4.34262Z"
                  fill="#000000"
                />
                <path
                  d="M13.2595 1.88008C13.3257 1.47119 13.7122 1.19381 14.1211 1.26001C14.1464 1.26485 14.2279 1.28007 14.2705 1.28958C14.3559 1.30858 14.4749 1.33784 14.6233 1.38106C14.9201 1.46751 15.3347 1.60991 15.8323 1.83805C16.8286 2.2948 18.1544 3.09381 19.5302 4.46961C20.906 5.84541 21.705 7.17122 22.1617 8.1675C22.3899 8.66511 22.5323 9.07972 22.6187 9.3765C22.6619 9.5249 22.6912 9.64393 22.7102 9.72926C22.7197 9.77193 22.7267 9.80619 22.7315 9.8315L22.7373 9.86269C22.8034 10.2716 22.5286 10.6741 22.1197 10.7403C21.712 10.8063 21.3279 10.5303 21.2601 10.1233C21.258 10.1124 21.2522 10.083 21.2461 10.0553C21.2337 9.99994 21.2124 9.91212 21.1786 9.79597C21.1109 9.56363 20.9934 9.2183 20.7982 8.79262C20.4084 7.94232 19.7074 6.76813 18.4695 5.53027C17.2317 4.2924 16.0575 3.59141 15.2072 3.20158C14.7815 3.00642 14.4362 2.88889 14.2038 2.82122C14.0877 2.78739 13.9417 2.75387 13.8863 2.74154C13.4793 2.67372 13.1935 2.2878 13.2595 1.88008Z"
                  fill="#000000"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.4861 5.32955C13.5999 4.93128 14.015 4.70066 14.4133 4.81445L14.2072 5.53559C14.4133 4.81445 14.4136 4.81455 14.414 4.81465L14.4147 4.81486L14.4162 4.81531L14.4196 4.81628L14.4273 4.81859L14.4471 4.82476C14.4622 4.82958 14.481 4.83586 14.5035 4.84383C14.5484 4.85976 14.6077 4.88243 14.6805 4.91363C14.8262 4.97607 15.0253 5.07249 15.2698 5.2172C15.7593 5.50688 16.4275 5.98806 17.2124 6.77303C17.9974 7.558 18.4786 8.22619 18.7683 8.71565C18.913 8.96016 19.0094 9.15923 19.0718 9.30491C19.103 9.37772 19.1257 9.43708 19.1416 9.48199C19.1496 9.50444 19.1559 9.52327 19.1607 9.53835L19.1669 9.55814L19.1692 9.56589L19.1702 9.56922L19.1706 9.57075L19.1708 9.57148C19.1709 9.57184 19.171 9.57219 18.4499 9.77823L19.171 9.57219C19.2848 9.97047 19.0542 10.3856 18.6559 10.4994C18.261 10.6122 17.8496 10.3864 17.7317 9.99438L17.728 9.9836C17.7227 9.96858 17.7116 9.93899 17.6931 9.89579C17.6561 9.80946 17.589 9.66823 17.4774 9.47963C17.2544 9.10289 16.8517 8.53364 16.1518 7.83369C15.4518 7.13374 14.8826 6.73103 14.5058 6.50806C14.3172 6.39645 14.176 6.32935 14.0897 6.29235C14.0465 6.27383 14.0169 6.2628 14.0019 6.25747L13.9911 6.25377C13.599 6.13589 13.3733 5.72445 13.4861 5.32955Z"
                  fill="#000000"
                />
              </svg> */}
            {/* 
              <div>
                <span className="block text-2xs text-dark-4 uppercase">
                  24/7 SUPPORT
                </span>
                <p className="font-medium text-custom-sm text-dark">
                  (+20) 114-042-2240
                </p>
              </div> */}
            {/* </div> */}

            {/* <!-- divider --> */}
            {/* <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span> */}

            {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2.5"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z"
                          fill="#000000"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5L3.24995 17.602C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25ZM4.75001 17.5C4.75001 16.6487 5.37139 15.7251 6.71085 14.9717C8.02681 14.2315 9.89529 13.75 12 13.75C14.1047 13.75 15.9732 14.2315 17.2892 14.9717C18.6286 15.7251 19.25 16.6487 19.25 17.5C19.25 18.8078 19.2097 19.544 18.5264 20.1004C18.1559 20.4022 17.5365 20.6967 16.4762 20.9113C15.4193 21.1252 13.9742 21.25 12 21.25C10.0258 21.25 8.58075 21.1252 7.5238 20.9113C6.46354 20.6967 5.84413 20.4022 5.4736 20.1004C4.79033 19.544 4.75001 18.8078 4.75001 17.5Z"
                          fill="#000000"
                        />
                      </svg>

                      <div>
                        <span className="block text-2xs text-dark-4 uppercase">
                          Account
                        </span>
                        <p className="font-medium text-custom-sm text-dark truncate max-w-[120px]">
                          {user.user_metadata?.full_name ||
                            user.email?.split("@")[0]}
                        </p>
                      </div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          href="/my-account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/my-orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Wishlist
                        </Link>
                        <Link
                          href="/cart"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Cart
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/signin" className="flex items-center gap-2.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z"
                        fill="#000000"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5L3.24995 17.602C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25ZM4.75001 17.5C4.75001 16.6487 5.37139 15.7251 6.71085 14.9717C8.02681 14.2315 9.89529 13.75 12 13.75C14.1047 13.75 15.9732 14.2315 17.2892 14.9717C18.6286 15.7251 19.25 16.6487 19.25 17.5C19.25 18.8078 19.2097 19.544 18.5264 20.1004C18.1559 20.4022 17.5365 20.6967 16.4762 20.9113C15.4193 21.1252 13.9742 21.25 12 21.25C10.0258 21.25 8.58075 21.1252 7.5238 20.9113C6.46354 20.6967 5.84413 20.4022 5.4736 20.1004C4.79033 19.544 4.75001 18.8078 4.75001 17.5Z"
                        fill="#000000"
                      />
                    </svg>

                    <div>
                      <span className="block text-2xs text-dark-4 uppercase">
                        account
                      </span>
                      <p className="font-medium text-custom-sm text-dark">
                        Sign In / Register
                      </p>
                    </div>
                  </Link>
                )}

                {/* Language Selector */}
                <LanguageSelector />

                {/* Theme Toggle */}
                {/* <ThemeToggle /> */}

                {/* Wishlist - Icon only with count badge */}
                <Link
                  href="/wishlist"
                  className="relative inline-flex items-center top-1"
                >
                  <svg
                    width="35"
                    height="35"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                      fill="#000000"
                    />
                  </svg>
                  <span
                    className="flex items-center justify-center font-bold text-xs absolute -right-0 -top-1  min-w-[18px] h-[18px] rounded-full text-white"
                    style={{
                      backgroundColor: "#EF4444",
                      // border: "2px solid white",
                    }}
                  >
                    {wishlistItems.length || 0}
                  </span>
                </Link>

                {/* Cart - Icon only with count badge */}

                <button
                  onClick={handleOpenCartModal}
                  className="relative inline-flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <path
                      d="M12 4V5C12 6.65685 10.6569 8 9 8C7.34315 8 6 6.65685 6 5V4M2.5 17H15.5C16.3284 17 17 16.3284 17 15.5V2.5C17 1.67157 16.3284 1 15.5 1H2.5C1.67157 1 1 1.67157 1 2.5V15.5C1 16.3284 1.67157 17 2.5 17Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>

                  <span
                    className="flex items-center justify-center font-bold text-xs absolute -right-3 -top-2 min-w-[18px] h-[18px] rounded-full text-white"
                    style={{
                      backgroundColor: "#EF4444",
                      // border: "2px solid white",
                    }}
                  >
                    {product.length || 0}
                  </span>
                </button>

            {/* <!-- Hamburger Toggle BTN --> */}
            <button
              id="Toggle"
              aria-label="Toggler"
              className="xl:hidden block"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <span className="block relative cursor-pointer w-5.5 h-5.5">
                <span className="du-block absolute right-0 w-full h-full">
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${
                      !navigationOpen && "!w-full delay-300"
                    }`}
                  ></span>
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${
                      !navigationOpen && "!w-full delay-400"
                    }`}
                  ></span>
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${
                      !navigationOpen && "!w-full delay-500"
                    }`}
                  ></span>
                </span>

                <span className="block absolute right-0 w-full h-full rotate-45">
                  <span
                    className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${
                      !navigationOpen && "!h-0 delay-[0] "
                    }`}
                  ></span>
                  <span
                    className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${
                      !navigationOpen && "!h-0 dealy-200"
                    }`}
                  ></span>
                </span>
              </span>
            </button>
            {/* //   <!-- Hamburger Toggle BTN --> */}
          </div>
        </div>
        {/* <!-- header topsasassa end --> sas*/}
      </div>

      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
