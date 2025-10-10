import { toast } from "sonner";

export const uploadToCloudinary = async (image) => {
  try {
    toast.loading("Uploading image...");
    const imageData = new FormData();
    imageData.append("file", image.file);
    imageData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDNIARY_UPLOAD_PRESET
    );
    imageData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDNIARY_NAME);

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dg2hozhrk/image/upload",
      {
        method: "POST",
        body: imageData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    const cloudImgUrl = await res.json();
    toast.success("Image uploaded successfully!");
    return cloudImgUrl.secure_url;
  } catch (err) {
    console.error("Error uploading image:", err.message);

    // Update toast to error
    toast.error("Failed to upload image. Please try again.");
    return null;
  }
};
