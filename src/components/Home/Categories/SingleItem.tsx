"use client";
import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";

const SingleItem = ({ item }: { item: Category }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Dispatch custom event to filter by category
    const event = new CustomEvent("categoryFilter", {
      detail: { category: item.title },
    });
    window.dispatchEvent(event);

    // Scroll to filter section
    const filterSection = document.getElementById("category-filter");
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a href="#" onClick={handleClick} className="group flex flex-col items-center cursor-pointer">
      <div className="max-w-[130px] w-full bg-brown-600 h-32.5 rounded-full flex items-center justify-center mb-4">
        <Image src={item.img} alt="Category" width={150} height={150} />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-brown-600 to-brown-600 bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-brown-600">
          {item.title}
        </h3>
      </div>
    </a>
  );
};

export default SingleItem;
