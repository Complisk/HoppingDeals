import Link from "next/link";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";

export const metadata = {
  title: "Complisk Business Directory",
  description:
    "Browse local businesses listed on Complisk and discover the deals they're running near you.",
  alternates: { canonical: "/complisk-business-directory" },
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Complisk Business Directory
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            The full directory experience is coming soon. In the meantime,
            browse active promotions on the home page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:underline"
          >
            ← Back to promotions
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
