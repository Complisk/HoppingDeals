"use client";

import React from "react";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import { motion } from "framer-motion";
const AboutUs = () => {
    return (<div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center">
              About Us
            </h1>

            <section className="mb-12">
              <h2 className="text-2xl font-bold  mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Complisk is a specialized promotion platform designed to bridge
                the gap between businesses and consumers. Our goal is to empower
                business owners to create customizable promotional banners
                targeted to specific locations, allowing users to discover
                active, relevant deals based on their current category interests
                and geography.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold  mb-4">
                The "Direct-to-Consumer" Advantage
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in a transparent marketplace. Every deal banner you
                see on our platform is created directly by the business owner
                for you. By eliminating the "middleman," Complisk takes no
                commissions or cuts from these transactions. This allows
                businesses to save money on marketing and pass those direct
                savings on to their customers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold  mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Complisk was born from real-world experience. Our founder, a
                former business owner, understood the immense effort and high
                costs required to attract new customers. For years, small local
                businesses have sought a technology platform that offers a
                simple, automated way to launch micro-promotions without the
                complexity of social media advertising, SEO, or traditional
                coupon sites. Complisk is the solution to those challenges.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>);
};
export default AboutUs;
