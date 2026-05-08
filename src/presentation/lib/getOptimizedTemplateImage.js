export const getOptimizedTemplateImage = (url, width = 300, height = 200) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`,
  );
};
