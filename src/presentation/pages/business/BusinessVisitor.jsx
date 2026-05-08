"use client";
import type, { RootState } from "@/presentation/store/index";
import { locations } from "@/data/mockData";
import Select from "react-select";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, Building2, Users, Briefcase, BarChart3, QrCode, } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import Footer from "@/presentation/components/homePage/Footer";
import { useSelector } from "react-redux";
import { ShoppingCart, } from "lucide-react";
import BusinessHeader from "@/presentation/components/shared/BusinessHeader";
import CreatePromotion from "./CreatePromotion";
const businessTypes = [
    {
        id: "small",
        name: "Small Business",
        icon: Users,
        description: "Local shops, boutiques, solo entrepreneurs, and startups",
        examples: ["Nail Salons", "Coffee Shops", "Boutique Stores", "Food Trucks"],
        color: "from-emerald-500 to-teal-500",
    },
    {
        id: "medium",
        name: "Medium Size Business",
        icon: Building2,
        description: "Growing businesses with multiple locations or larger operations",
        examples: [
            "Restaurant Chains",
            "Auto Dealerships",
            "Regional Retailers",
            "Hotel Groups",
        ],
        color: "from-blue-500 to-indigo-500",
    },
    {
        id: "large",
        name: "Large Corporation",
        icon: Briefcase,
        description: "Enterprises with nationwide presence and extensive operations",
        examples: [
            "National Chains",
            "Franchises",
            "Major Brands",
            "Corporate Groups",
        ],
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "online-ecommerce",
        name: "Online Ecommerce Store",
        icon: ShoppingCart,
        description: "Online stores, digital marketplaces, and dropshipping",
        examples: [
            "Online Stores",
            "Marketplaces",
            "Dropshipping",
            "Digital Products",
        ],
        color: "from-orange-500 to-red-500",
    },
];
const benefits = [
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        description: "Track views, scans, and engagement",
    },
    {
        icon: QrCode,
        title: "Unique QR Codes",
        description: "Each promotion gets a scannable QR code",
    },
    {
        icon: Clock,
        title: "Time-based Targeting",
        description: "Run promotions at the perfect time",
    },
    {
        icon: MapPin,
        title: "Location Control",
        description: "Target specific cities and regions",
    },
];
const BusinessVisitor = () => {
    const isBusinessLoggedIn = useSelector((state) => state.auth.businessToken !== null);
    return (<div className="min-h-screen bg-background">
      <BusinessHeader />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"/>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Grow Your Business with{" "}
              <span className="text-primary">Local Promotions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create stunning promotions, target local customers, and watch your
              business grow. No design skills needed — launch in minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link href={isBusinessLoggedIn
            ? "/business/dashboard"
            : "/business/register"}>
                  {isBusinessLoggedIn ? "Go to Dashboard" : "Start Now"}
                  <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#templates">View Templates</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Business Type
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the category that best describes your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {businessTypes.map((type, index) => (<motion.div key={type.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="relative bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/50 transition-all">
                <div className={`h-2 bg-gradient-to-r ${type.color}`}/>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}>
                      <type.icon className="h-7 w-7 text-white"/>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {type.name}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {type.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Examples:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((example, i) => (<span key={i} className="px-2 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                          {example}
                        </span>))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/business/register?businessType=${type.id}`}>
                      Register as {type.name.split(" ")[0]}
                    </Link>
                  </Button>
                </div>
              </motion.div>))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-card rounded-2xl p-6 border border-border text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-primary"/>
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>))}
          </div>
        </div>
      </section>
      <div className="px-16">
        <CreatePromotion isVisitor={true}/>
      </div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using Complisk to reach local
              customers
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="secondary" size="xl" asChild>
                <Link href="/business/register">
                  Register Your Business
                  <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/business/login">
                  Already have an account? Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>);
};
export default BusinessVisitor;
