import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopverse",
  description: "Home Page",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
