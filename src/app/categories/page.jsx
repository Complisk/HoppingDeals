import Link from "next/link";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import { categories } from "@/data/mockData";

export const metadata = {
  title: "Categories | Complisk",
  description:
    "Browse promotions by category — restaurants, retail, services, and more.",
  alternates: { canonical: "/categories" },
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
            <p className="text-muted-foreground">
              Browse active local promotions by category.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="group flex flex-col items-center justify-center text-center rounded-xl border border-gray-200 bg-white p-5 hover:border-[#E31E24] hover:shadow-md transition"
              >
                <span
                  className="text-3xl md:text-4xl mb-2"
                  aria-hidden="true"
                  style={{ color: c.color }}
                >
                  {c.icon}
                </span>
                <span className="text-sm md:text-base font-medium text-gray-800 group-hover:text-[#E31E24]">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
