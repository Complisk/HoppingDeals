"use client";
import { Store } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Phone,
  Users,
  Briefcase,
  Check,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import Logo from "@/presentation/components/shared/Logo";
import { useToast } from "@/presentation/hooks/use-toast";
import { cn } from "@/presentation/lib/utils";
import { useAppDispatch, useAppSelector } from "@/presentation/hooks/use-redux";
import { useAuthService } from "@/presentation/services/authService";
const businessTypes = [
  {
    id: "small",
    name: "Small Business",
    icon: Users,
    description: "Local shops, boutiques, solo entrepreneurs",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "medium",
    name: "Medium Size Business",
    icon: Building2,
    description: "Growing businesses with multiple locations",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "large",
    name: "Large Corporation",
    icon: Briefcase,
    description: "Enterprises with nationwide presence",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "online-ecommerce",
    name: "Online Ecommerce Store",
    icon: ShoppingCart,
    description: "Online stores, digital marketplaces, dropshipping",
    color: "from-orange-500 to-red-500",
  },
];
const businessCategories = [
  "Restaurants",
  "Beauty & Spas",
  "Home & Garden",
  "Coffee & Tea",
  "Food",
  "Auto Services",
  "Pets",
  "Professional Services",
  "Health & Medical",
  "Event Planning & Services",
  "Hotels & Casinos",
  "Nightlife",
  "Active Life",
  "Education",
  "Arts & Entertainment",
  "Travel & Activities",
  "Online Shopping",
  "Shopping",
  "Real Estate",
  "Mass Media",
  "General Merchandise Store",
];
const BusinessRegister = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [personName, setPersonName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [keyboardNavIndex, setKeyboardNavIndex] = useState(-1);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const categoryInputRef = useRef(null);
  const navigate = useRouter();
  // next/navigation returns the URLSearchParams instance directly (unlike
  // react-router v6, which returned a tuple).
  const searchParams = useSearchParams();
  const typeFromParams = searchParams?.get("businessType") ?? null;
  const [selectedType, setSelectedType] = useState(typeFromParams || null);
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { registerBusiness } = useAuthService();
  // Filter categories based on search
  const filteredCategories = businessCategories.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase()),
  );
  // Handle keyboard navigation in category dropdown
  useEffect(() => {
    if (!isSelectOpen) {
      setKeyboardNavIndex(-1);
      setCategorySearch("");
      return;
    }
    setKeyboardNavIndex(-1);
  }, [isSelectOpen]);
  const handleCategoryKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardNavIndex((prev) =>
        prev < filteredCategories.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardNavIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        keyboardNavIndex >= 0 &&
        keyboardNavIndex < filteredCategories.length
      ) {
        const category = filteredCategories[keyboardNavIndex];
        if (selectedCategories.includes(category)) {
          setSelectedCategories(
            selectedCategories.filter((c) => c !== category),
          );
        } else if (selectedCategories.length < 2) {
          setSelectedCategories([...selectedCategories, category]);
          setKeyboardNavIndex(-1);
          setCategorySearch("");
        } else {
          toast({
            title: "Limit Reached",
            description: "You can select a maximum of 2 categories",
            variant: "destructive",
          });
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSelectOpen(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !businessName ||
      !email ||
      !phone ||
      !personName ||
      !businessAddress ||
      !password ||
      !confirmPassword
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a business type",
        variant: "destructive",
      });
      return;
    }
    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one business category",
        variant: "destructive",
      });
      return;
    }
    if (selectedCategories.length > 2) {
      toast({
        title: "Error",
        description: "You can select a maximum of 2 categories",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await registerBusiness(dispatch, {
        name: businessName,
        email,
        password,
        phone,
        businessType: selectedType || "",
        categories: selectedCategories,
        personName,
        businessAddress,
      });
      console.log("Registration response:", response);
      if (response) {
        toast({
          title: "Welcome to Complisk!",
          description: "Your business account has been created successfully.",
        });
        navigate.push("/business/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-6">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Register Your Business
          </h1>
          <p className="text-muted-foreground mb-6">
            Create an account to start promoting your business
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Business Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Select Your Business Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center`}
                    >
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-foreground text-sm">
                        {type.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                    {selectedType === type.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Category Selection - Select Dropdown (Max 2) */}
            <div className="space-y-2">
              <Label htmlFor="categories">
                Business Categories (Select up to 2)
              </Label>
              <div className="space-y-2">
                {/* Display selected categories as badges */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center gap-2 bg-primary/10 border border-primary rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-primary">
                          {category}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(
                              selectedCategories.filter((c) => c !== category),
                            )
                          }
                          className="text-primary hover:text-primary/80 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Category selector with search */}
                <div className="relative">
                  <Select open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedCategories.length > 0
                            ? `${selectedCategories.length} category/categories selected`
                            : "Select a business category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 p-0">
                      {/* Search Input */}
                      <div className="sticky top-0 p-2 border-b bg-background z-10">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            ref={categoryInputRef}
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => {
                              setCategorySearch(e.target.value);
                              setKeyboardNavIndex(-1);
                            }}
                            onKeyDown={handleCategoryKeyDown}
                            autoFocus
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                          />
                        </div>
                      </div>

                      {/* Category Options */}
                      <div className="max-h-56 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category, index) => (
                            <button
                              key={category}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedCategories.includes(category)) {
                                  setSelectedCategories(
                                    selectedCategories.filter(
                                      (c) => c !== category,
                                    ),
                                  );
                                } else if (selectedCategories.length < 2) {
                                  setSelectedCategories([
                                    ...selectedCategories,
                                    category,
                                  ]);
                                  setCategorySearch("");
                                } else {
                                  toast({
                                    title: "Limit Reached",
                                    description:
                                      "You can select a maximum of 2 categories",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 transition-colors flex items-center gap-2 border-l-4",
                                selectedCategories.includes(category)
                                  ? "bg-primary/10 text-primary font-medium border-l-primary"
                                  : keyboardNavIndex === index
                                    ? "bg-muted text-foreground border-l-muted-foreground"
                                    : "hover:bg-muted text-foreground border-l-transparent",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                  selectedCategories.includes(category)
                                    ? "border-primary bg-primary"
                                    : "border-border",
                                )}
                              >
                                {selectedCategories.includes(category) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="flex-1">{category}</span>
                              {keyboardNavIndex === index && (
                                <span className="text-xs text-muted-foreground">
                                  ↵
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No categories found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="Your Business"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Contact Person Name */}
            <div className="space-y-2">
              <Label htmlFor="personName">Contact Person Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="personName"
                  placeholder="John Doe"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Business Location — matches the live site copy. Once we wire
                up Google Places autocomplete, swap the Input for the search
                widget; until then this stays as a manual text entry. */}
            <div className="space-y-2">
              <Label htmlFor="businessAddress">
                Business Location (Type your business name here if not listed
                on Google)
              </Label>
              <Input
                id="businessAddress"
                placeholder="Enter your business location manually"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use this if your business is not available in Google search.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/business/login"
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Customer View
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground"
        >
          <Building2 className="h-24 w-24 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Join hundreds of Businesses
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            Create promotions, reach local customers, and grow your business
            with Complisk.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">50K+</div>
              <div className="text-sm opacity-70">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-sm opacity-70">Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold">98%</div>
              <div className="text-sm opacity-70">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default BusinessRegister;
