import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import PromoBanner from "../PromoBanner";
import SpecialOrders from "../SpecialOrders";
import ShopWithSidebar from "../ShopWithSidebar";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <PromoBanner />
      <SpecialOrders />
      <ShopWithSidebar />
    </main>
  );
};

export default Home;
