import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const folderRoot = process.env.CLOUDINARY_FOLDER || "resinart";

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function ensureConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary environment variables are not configured");
    error.status = 500;
    throw error;
  }
}

export async function cleanupLocalFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") console.warn(`Could not clean temporary upload ${filePath}: ${error.message}`);
  }
}

export async function uploadImageToCloudinary(file, folder, options = {}) {
  ensureConfigured();
  if (!file?.path) {
    const error = new Error("Image file is required");
    error.status = 400;
    throw error;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `${folderRoot}/${folder}`,
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: options.width || 1400, crop: "limit" }],
      ...options
    });
    return result.secure_url;
  } finally {
    await cleanupLocalFile(file.path);
  }
}

export async function uploadManyImagesToCloudinary(files = [], folder, options = {}) {
  const urls = [];
  for (const file of files) {
    urls.push(await uploadImageToCloudinary(file, folder, options));
  }
  return urls;
}

export function getCloudinaryPublicId(url) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return null;
  try {
    const pathname = new URL(url).pathname;
    const [, afterUpload = ""] = pathname.split("/upload/");
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^.]+$/, "");
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(url) {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
