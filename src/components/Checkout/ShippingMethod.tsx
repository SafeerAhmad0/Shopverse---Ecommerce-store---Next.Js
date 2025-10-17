import React, { useState } from "react";
import Image from "next/image";

const ShippingMethod = () => {
  const [shippingMethod, setShippingMethod] = useState("door-to-door");
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="door-to-door"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shippingMethod"
                id="door-to-door"
                className="sr-only"
                checked={shippingMethod === "door-to-door"}
                onChange={() => setShippingMethod("door-to-door")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "door-to-door"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark">Door to Door Delivery</p>
              <p className="text-sm text-dark-4">We will deliver to your address</p>
            </div>
          </label>

          <label
            htmlFor="pickup"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="radio"
                name="shippingMethod"
                id="pickup"
                className="sr-only"
                checked={shippingMethod === "pickup"}
                onChange={() => setShippingMethod("pickup")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  shippingMethod === "pickup"
                    ? "border-4 border-blue"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark">Receiving from Company</p>
              <p className="text-sm text-dark-4">Pick up from our location</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
