import Link from "next/link";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";

export const metadata = {
  title: "Photo Gallery",
  description:
    "Browse photos shared by Complisk users and discover deals from local businesses.",
  alternates: { canonical: "/photos" },
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Gallery</h1>
          <p className="text-lg text-muted-foreground mb-8">
            The photo gallery is coming soon.
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
