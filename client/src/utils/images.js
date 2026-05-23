export function cloudinaryImage(url, options = {}) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const width = options.width || 900;
  const quality = options.quality || "auto:good";
  return url.replace("/upload/", `/upload/f_auto,q_${quality},c_limit,w_${width}/`);
}
