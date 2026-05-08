"use client";

import { ToastContainer } from "react-toastify";
import { Toaster as Sonner } from "@/presentation/components/ui/sonner";

export default function ToastProvider() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Sonner />
    </>
  );
}
