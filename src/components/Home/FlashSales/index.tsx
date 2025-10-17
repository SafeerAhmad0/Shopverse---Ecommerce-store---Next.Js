"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

type FlashSale = {
  id: string;
  product_id: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  end_date: string;
  stock_limit: number;
  stock_sold: number;
  product: {
    id: string;
    title: string;
    image_url: string;
    images: string[];
  };
};

const FlashSales = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("flash_sales")
      .select(`
        *,
        product:products(id, title, image_url, images)
      `)
      .eq("is_active", true)
      .gte("end_date", new Date().toISOString())
      .order("end_date", { ascending: true })
      .limit(4);

    if (data && !error) {
      setFlashSales(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="overflow-hidden pt-17.5 bg-gray-1">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <p className="text-center py-12">Loading flash sales...</p>
        </div>
      </section>
    );
  }

  if (flashSales.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden pt-17.5 bg-gray-1">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2L12.0206 7.62361L18 8.42361L14 12.6736L15.0412 18.5764L10 15.6236L4.95878 18.5764L6 12.6736L2 8.42361L7.97936 7.62361L10 2Z"
                  fill="#FBBF24"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Flash Sales
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Limited Time Offers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FlashSaleCard = ({ sale }: { sale: FlashSale }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(sale.end_date).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sale.end_date]);

  const getImage = () => {
    if (sale.product.images && sale.product.images.length > 0) {
      return sale.product.images[0];
    }
    return sale.product.image_url || "/images/placeholder.png";
  };

  const stockPercentage = sale.stock_limit
    ? ((sale.stock_limit - sale.stock_sold) / sale.stock_limit) * 100
    : 100;

  return (
    <Link
      href={`/shop-details/${sale.product_id}`}
      className="bg-white rounded-lg shadow-1 overflow-hidden hover:shadow-2 transition-shadow group"
    >
      <div className="relative">
        <div className="aspect-square relative overflow-hidden bg-gray-2">
          <Image
            src={getImage()}
            alt={sale.product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="absolute top-3 right-3 bg-red text-white px-3 py-1 rounded-full text-xs font-bold">
          {sale.discount_percentage}% OFF
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-dark mb-2 line-clamp-2 group-hover:text-blue transition-colors">
          {sale.product.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-blue">${sale.sale_price}</span>
          <span className="text-sm text-gray-500 line-through">${sale.original_price}</span>
        </div>

        {sale.stock_limit && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Stock</span>
              <span>
                {sale.stock_limit - sale.stock_sold} / {sale.stock_limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue h-2 rounded-full transition-all"
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="bg-gray-1 rounded-md p-2">
          <p className="text-xs text-gray-600 text-center mb-1">Ends in</p>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <div className="text-sm font-bold text-dark">{timeLeft.days}</div>
              <div className="text-2xs text-gray-500">Days</div>
            </div>
            <div>
              <div className="text-sm font-bold text-dark">{timeLeft.hours}</div>
              <div className="text-2xs text-gray-500">Hrs</div>
            </div>
            <div>
              <div className="text-sm font-bold text-dark">{timeLeft.minutes}</div>
              <div className="text-2xs text-gray-500">Min</div>
            </div>
            <div>
              <div className="text-sm font-bold text-dark">{timeLeft.seconds}</div>
              <div className="text-2xs text-gray-500">Sec</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FlashSales;
