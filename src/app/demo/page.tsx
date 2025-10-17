"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  title: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  stock: number;
  category_id?: string;
  image_url?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
}

interface Category {
  id: string;
  name: string;
}

export default function PolishedMinimalStore() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const featuredRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('in_date', { ascending: false });

      if (categoriesData) setCategories(categoriesData);
      if (productsData) {
        setProducts(productsData);

        // Set featured products (first 3 with images)
        const featured = productsData
          .filter(p => p.image_url)
          .slice(0, 3);
        setFeaturedProducts(featured);

        // Set hero images from featured products
        const images = featured
          .map(p => p.image_url)
          .filter(Boolean) as string[];
        setHeroImages(images.length > 0 ? images : ['/placeholder-image.jpg']);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => [...prev, product]);
  };

  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin" style={{ borderColor: "#E0E7FF", borderTopColor: "#3B82F6" }}></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.header
        className="border-b border-gray-100 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.h1
            className="text-2xl font-light text-gray-900"
            whileHover={{ scale: 1.05 }}
          >
            Minimal Store
          </motion.h1>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
          >
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{cartItems.length}</span>
            </div>
            {cartItems.length > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {cartItems.length}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.header>

      {heroImages.length > 0 && (
        <section className="relative mb-16">
          <motion.div
            className="relative h-96 overflow-hidden bg-gray-50"
            style={{ y }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
              >
                <div className="w-full h-full bg-white flex items-center justify-center relative">
                  <Image
                    src={heroImages[currentSlide]}
                    alt="Hero image"
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="text-center text-white">
                      <motion.h2
                        className="text-4xl font-light mb-2"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        Premium Quality
                      </motion.h2>
                      <motion.p
                        className="text-lg font-light"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        Discover our curated collection
                      </motion.p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-sm transition-all"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-sm transition-all"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroImages.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <motion.section
          ref={featuredRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">Featured Items</h2>
            <div className="w-24 h-0.5 bg-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">Handpicked favorites from our collection</p>
          </motion.div>

          <div className="relative">
            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex-none w-80 bg-white border border-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.01 }}
                  onMouseEnter={() => setHoveredProduct(`featured-${product.id}`)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <div className="absolute inset-0 bg-white flex items-center justify-center p-6">
                      <motion.div
                        className="relative w-full h-full"
                        animate={{
                          scale: hoveredProduct === `featured-${product.id}` ? 1.1 : 1
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-contain drop-shadow-xl"
                            sizes="(max-width: 768px) 100vw, 320px"
                          />
                        )}
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      FEATURED
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <motion.h3
                      className="text-lg font-medium text-gray-900 mb-2"
                      animate={{
                        x: hoveredProduct === `featured-${product.id}` ? 10 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {product.title}
                    </motion.h3>

                    <motion.div
                      className="flex items-center mb-3"
                      animate={{
                        x: hoveredProduct === `featured-${product.id}` ? 10 : 0
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <motion.svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            initial={{ opacity: 0, rotate: -180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </motion.svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({product.reviews || 45})</span>
                    </motion.div>

                    <motion.p
                      className="text-sm text-gray-600 mb-4 font-light leading-relaxed line-clamp-2"
                      animate={{
                        x: hoveredProduct === `featured-${product.id}` ? 10 : 0
                      }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {product.description_en || "Premium quality product"}
                    </motion.p>

                    <motion.div
                      className="flex items-center justify-between"
                      animate={{
                        x: hoveredProduct === `featured-${product.id}` ? 10 : 0
                      }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <span className="text-xl font-light text-gray-900">${product.price}</span>
                      <motion.button
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                        onClick={() => addToCart(product)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {categories.length > 0 && (
        <motion.section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">Shop by Category</h2>
            <div className="w-24 h-0.5 bg-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">Browse our carefully curated categories</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="group bg-white border border-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-900 transition-colors duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg
                    className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </motion.div>
                <motion.h3
                  className="text-sm font-medium text-gray-900 group-hover:text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {category.name}
                </motion.h3>
                <motion.p
                  className="text-xs text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {products.filter(p => p.category_id === category.id).length} items
                </motion.p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-light text-gray-900 mb-4">All Products</h2>
          <div className="w-24 h-0.5 bg-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Carefully selected items for modern living</p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 8) * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ scale: 1.01 }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative aspect-square bg-white flex items-center justify-center border-b border-gray-100 overflow-hidden p-4">
                  <motion.div
                    className="relative w-full h-full"
                    animate={{
                      scale: hoveredProduct === product.id ? 1.1 : 1
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-contain drop-shadow-lg"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                        <svg className="w-16 h-16" style={{ color: "#CBD5E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </motion.div>

                  {product.category_id && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {getCategoryName(product.category_id)}
                    </div>
                  )}

                  {product.stock < 10 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {product.stock === 0 ? 'Out of Stock' : `Only ${product.stock} left`}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <motion.h3
                    className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors"
                    animate={{
                      x: hoveredProduct === product.id ? 5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.title}
                  </motion.h3>

                  <motion.div
                    className="flex items-center mb-2"
                    animate={{
                      x: hoveredProduct === product.id ? 5 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">({product.reviews || 32})</span>
                  </motion.div>

                  <motion.p
                    className="text-sm text-gray-600 mb-3 font-light leading-relaxed line-clamp-2"
                    animate={{
                      x: hoveredProduct === product.id ? 5 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {product.description_en || "High-quality product"}
                  </motion.p>

                  <motion.div
                    className="flex items-center justify-between"
                    animate={{
                      x: hoveredProduct === product.id ? 5 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <span className="text-xl font-light text-gray-900">${product.price}</span>
                    <motion.button
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      whileHover={{ scale: product.stock > 0 ? 1.05 : 1 }}
                      whileTap={{ scale: product.stock > 0 ? 0.95 : 1 }}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <motion.footer
        className="bg-gray-50 border-t border-gray-100 py-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            className="text-gray-600 font-light"
            whileHover={{ scale: 1.05 }}
          >
            © 2024 Minimal Store. Crafted with care.
          </motion.p>
        </div>
      </motion.footer>
    </motion.div>
  );
}
