"use client";

import { useEffect, useState } from "react";
import Header from "@/presentation/components/homePage/Header";
import Footer from "@/presentation/components/homePage/Footer";
import OptimizeImage from "@/presentation/components/shared/OptimizeImage";
import fetchData from "@/presentation/lib/apiAction";

export default function Page() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPhotos = async () => {
      try {
        const { response } = await fetchData("/photos", { method: "GET" });
        const list = response?.photos;
        if (mounted) {
          setPhotos(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Failed to load public photos:", error);
        if (mounted) {
          setPhotos([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPhotos();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="w-full bg-gradient-to-br py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <svg
                  className="h-8 w-8 animate-spin text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </div>
            ) : photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white/70 px-6 py-16 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  No photos available right now
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  The Complisk admin team has not published any gallery items
                  yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {photo.cloudinaryPublicId ? (
                        <OptimizeImage
                          publicId={photo.cloudinaryPublicId}
                          alt={photo.altText || photo.title}
                          className="h-full w-full "
                        />
                      ) : (
                        <img
                          src={photo.imageUrl}
                          alt={photo.altText || photo.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="py-4 px-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {photo.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
