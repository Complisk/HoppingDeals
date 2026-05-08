"use client";

import { accessibility, placeholder } from "@cloudinary/react";
import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, lazyload, responsive, } from "@cloudinary/react";
// Create a Cloudinary instance
const cld = new Cloudinary({
    cloud: {
        cloudName: "dgdfenqsv",
    },
});
const OptimizeImage = ({ publicId }) => {
    // Create a Cloudinary image object
    const cldImage = cld.image(publicId);
    return (<AdvancedImage cldImg={cldImage} className="w-full h-full " plugins={[
            lazyload(), // lazy load images
            responsive(), // responsive resizing
            // accessibility(), // accessibility attributes
            // placeholder(), // placeholder while loading
        ]}/>);
};
export default OptimizeImage;
