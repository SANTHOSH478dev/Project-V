import React, { useContext, useEffect } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  "pk_test_51RRUidP7Ot4zn2nOrOOOQa9fQQ8sdaj9Legj5sjHqa9k0KisLlfpcTurd3WCq80wBV9F99KyDMQuuuoc5iix8nJW00ztorB7ys"
);

const BuyCredit = () => {
  const { user, backendUrl, loadCreditsData, token } = useContext(AppContext);

  const handlePurchase = async (planId) => {
    try {
      const stripe = await stripePromise;

      // Retrieve userId from local storage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID is missing");
      }

      // Create a checkout session
      const response = await fetch(
        `${backendUrl}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId, userId }), // Include both planId and userId
        }
      );

      const session = await response.json();

      if (response.ok && session.url) {
        // Redirect to the Stripe Checkout session
        handlePostPayment(planId, userId);
        window.location.href = session.url;
      } else {
        throw new Error(
          session.message || "Failed to create checkout session."
        );
      }
    } catch (error) {
      console.error(error.message);
      toast.error(
        error.message || "An error occurred while processing the payment."
      );
    }
  };

  const handlePostPayment = async (planId, userId) => {
    if (planId && userId) {
      try {
        // Confirm payment and update credits
        const response = await fetch(
          `${backendUrl}/api/stripe/confirm-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planId, userId }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          toast.success("Credits updated successfully!");
          console.log("Payment confirmed:", result);

          // Optionally reload credits data after successful payment
          if (loadCreditsData) loadCreditsData();
        } else {
          throw new Error(result.message || "Failed to confirm payment.");
        }
      } catch (error) {
        console.error("Error confirming payment:", error.message);
        toast.error(
          error.message || "An error occurred while confirming the payment."
        );
      }
    }
  };

  // Check for post-payment success only when the URL has the `success=true` parameter
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   if (urlParams.get('success') === 'true') {
  //     handlePostPayment();
  //   }
  // }, []);

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price}</span> /{" "}
              {item.credits} credits
            </p>

            <button
              onClick={() => handlePurchase(item.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
