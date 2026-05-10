"use client";

// Footer — mirrors the live complisk.com layout: 3-column links + a bottom
// row with legal links and locale buttons. The shared/Footer.jsx variant
// re-exports this for backwards compatibility with older imports.

import Link from "next/link";
import SupportMessageDialog from "@/presentation/components/shared/SupportMessageDialog";

function InstagramIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const ghostTriggerClass =
  "h-auto p-0 text-gray-400 hover:text-white transition bg-transparent hover:bg-transparent justify-start font-normal";

export default function Footer() {
  return (
    <footer className="bg-[#1A1110] text-gray-400 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Support */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">Support</h3>
            <p className="text-sm text-gray-400 mb-3">
              User or business owner? Send us a message.
            </p>
            <SupportMessageDialog
              triggerLabel="Message Support"
              triggerClassName="bg-white text-black hover:bg-gray-200"
            />
          </div>

          {/* Business Resources */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">
              Business Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Promotion Strategy
                </Link>
              </li>
              <li>
                <Link
                  href="/complisk-business-directory"
                  className="hover:text-white transition"
                >
                  Complisk Business Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Complisk */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">Complisk</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about-us" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Media News"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={ghostTriggerClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Career"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={ghostTriggerClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Investors"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={ghostTriggerClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Non-Profit Organization"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={ghostTriggerClass}
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
          <Link href="/terms" className="hover:text-white transition">
            <p>
              © 2025 Complisk, Inc. - Terms - Sitemap - Privacy - Your Privacy
              Choice ?
            </p>
          </Link>

          <div className="flex items-center space-x-6 text-white font-medium">
            <a
              href="https://www.instagram.com/complisk_promo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Complisk on Instagram"
              className="text-gray-400 hover:text-white transition"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="flex items-center hover:underline transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"
                />
              </svg>
              English
            </button>
            <button type="button" className="hover:underline transition">
              $ USD
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
