import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pallets",
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
