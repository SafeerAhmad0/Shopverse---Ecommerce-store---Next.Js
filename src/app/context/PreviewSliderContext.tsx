"use client";
import React, { createContext, useContext, useState } from "react";
import type { Product } from "@/types/product"; // adjust path

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  activeProduct: Product | null;
  activeIndex: number;
  openPreviewModal: (product: Product, index?: number) => void;
  closePreviewModal: () => void;
  setActiveIndex: (index: number) => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    throw new Error("usePreviewSlider must be used within a PreviewSliderProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const openPreviewModal = (product: Product, index: number = 0) => {
    setActiveProduct(product);
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
    setActiveProduct(null);
    setActiveIndex(0);
  };

  return (
    <PreviewSlider.Provider
      value={{
        isModalPreviewOpen,
        activeProduct,
        activeIndex,
        openPreviewModal,
        closePreviewModal,
        setActiveIndex,
      }}
    >
      {children}
    </PreviewSlider.Provider>
  );
};
