"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Info, LogIn, UserPlus, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import Logo from "./Logo";
const BusinessHeader = () => {
    const dispatch = useDispatch();
    const navigate = useRouter();
    const business = useSelector((state) => state.auth.business);
    const isBusinessLoggedIn = useSelector((state) => state.auth.businessToken !== null);
    const handleLogout = () => {
        dispatch(logout());
        navigate.push("/business/login");
    };
    return (<>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-6 px-4 sm:px-8 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}

          <Logo />

          {/* Business Name or Login */}
          <div className="flex-1 text-center">
            {isBusinessLoggedIn && business ? (<h1 className="text-2xl font-bold text-gray-800">
                {business.name}
              </h1>) : null}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {!isBusinessLoggedIn && (<Link href={"/business/login"}>
                <button className="text-[#E31E24] font-medium text-lg hover:underline">
                  Login
                </button>
              </Link>)}
            {isBusinessLoggedIn && (<Link href={"/business/dashboard"}>
                <button className="text-[#E31E24] font-medium text-lg hover:underline">
                  Dashboard
                </button>
              </Link>)}

            {/* MENU */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-xl border-gray-200 hover:bg-gray-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/>
                  </svg>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} asChild>
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className="w-56 rounded-2xl bg-white/90 backdrop-blur-xl
                               shadow-xl border border-gray-200  z-50 p-2">
                    <MenuItem icon={<Info />} label="About Us" to="/about"/>
                    {!isBusinessLoggedIn && (<>
                        <MenuItem icon={<LogIn />} label="Login" to="/business/login"/>
                        <MenuItem icon={<UserPlus />} label="Register" to="/business/register"/>
                      </>)}
                    {isBusinessLoggedIn && (<MenuItem icon={<LogOut />} label="Logout" onClick={handleLogout}/>)}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-24"/>
    </>);
};
export default BusinessHeader;
/* ---------- Menu Item Component ---------- */
const MenuItem = ({ icon, label, to, onClick, }) => {
    const content = (<div className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition">
      <span className="text-[#E31E24]">{icon}</span>
      {label}
    </div>);
    if (onClick) {
        return (<DropdownMenu.Item asChild>
        <button onClick={onClick} className="w-full text-left">
          {content}
        </button>
      </DropdownMenu.Item>);
    }
    if (to) {
        return (<DropdownMenu.Item asChild>
        <Link href={to}>{content}</Link>
      </DropdownMenu.Item>);
    }
    return (<DropdownMenu.Item className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition">
      <span className="text-[#E31E24]">{icon}</span>
      {label}
    </DropdownMenu.Item>);
};
