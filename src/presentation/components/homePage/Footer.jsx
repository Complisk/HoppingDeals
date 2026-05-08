"use client";

import React from "react";
const Footer = () => {
    return (<footer className="bg-[#1A1110] text-gray-400 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Support Column */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">Support</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Help us improve your experiences
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Report bad practices
                </a>
              </li>
            </ul>
          </div>

          {/* Business Resources Column */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">
              Business Resources
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-white transition">
                  Promotion Strategy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Large Corporation Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Complisk Column */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-8">Complisk</h3>
            <ul className="space-y-4">
              <li>
                <a href="/about-us" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Media News
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Career
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Non-Profit Organization
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
          <a href="/terms" className="hover:text-white transition">
            <p>
              © 2025 Complisk, Inc. - Terms - Sitemap - Privacy - Your Privacy
              Choice ?
            </p>
          </a>{" "}
          <div className="flex items-center space-x-6 text-white font-medium">
            <button className="flex items-center hover:underline transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"/>
              </svg>
              English
            </button>
            <button className="hover:underline transition">$ USD</button>
          </div>
        </div>
      </div>
    </footer>);
};
export default Footer;
