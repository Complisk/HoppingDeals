"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { Menu, Info, BookOpen, Image, Grid, LogOut } from "lucide-react";
import { logout as userLogout } from "@/presentation/store/authSlice";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";
const Header = () => {
    const navigate = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const business = useSelector((state) => state.auth.business);
    const accountType = useSelector((state) => state.auth.accountType);
    const handleLogout = () => {
        dispatch(userLogout());
        navigate.push("/auth/login");
    };
    return (<>
      <header className="py-3 px-4 z-40 sm:px-8 border-b border-gray-100 fixed top-0 left-0 right-0 bg-white ">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <Link href={"/business/visitor"}>
              <button className="text-[#E31E24] font-medium text-lg hover:underline">
                Business Portal
              </button>
            </Link>

            {/* MENU */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-xl  border-gray-200 hover:bg-gray-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/>
                  </svg>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} asChild>
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className="w-56 rounded-2xl bg-white/90 backdrop-blur-xl
                             shadow-xl border border-gray-200 z-50 p-2">
                    <Link href="/about-us">
                      <MenuItem icon={<Info />} label="About Us"/>
                    </Link>
                    <MenuItem icon={<BookOpen />} label="Blog"/>
                    <MenuItem icon={<Image />} label="Photos"/>
                    <MenuItem icon={<Grid />} label="Categories"/>

                    {/* Show Login/Register only if not authenticated */}
                    {!user && !business && (<>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200"/>
                        <Link href="/auth/login">
                          <MenuItem icon={<Info />} label="Login"/>
                        </Link>
                        <Link href="/auth/register">
                          <MenuItem icon={<Info />} label="Register"/>
                        </Link>
                      </>)}

                    {/* Show User/Business Name and Logout if authenticated */}
                    {(user || business) && (<>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200"/>
                        <div className="px-4 py-3 text-gray-700 text-sm font-medium">
                          {user?.fullName || business?.name}
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                 cursor-pointer text-gray-700 text-sm font-medium
                                 hover:bg-red-50 hover:text-[#E31E24]
                                 focus:outline-none transition">
                          <span className="text-[#E31E24]">
                            <LogOut size={18}/>
                          </span>
                          Logout
                        </button>
                      </>)}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-sm gap-4">
          {/* Location Search */}
          <HeaderLocationSearch />

          {/* User Welcome */}
          {(user?.fullName || business?.name) && (<span className="text-gray-700 font-medium whitespace-nowrap">
              Welcome • {user?.fullName || business?.name}
            </span>)}
        </div>
      </header>
      <div className=" h-28"></div>
    </>);
};
export default Header;
/* ---------- Menu Item Component ---------- */
const MenuItem = ({ icon, label, }) => (<DropdownMenu.Item className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition">
    <span className="text-[#E31E24]">{icon}</span>
    {label}
  </DropdownMenu.Item>);
