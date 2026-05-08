"use client";
import Link from "next/link";
const Logo = ({ variant = "default", size = "md", showText = true, }) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
    };
    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
    };
    return (<Link href="/">
      <img src="/5aae838731ab6f23ea08b4698b32f72f92bbf1d1 (1).png" className=" w-24 " alt=""/>
    </Link>);
};
export default Logo;
