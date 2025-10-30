import { toast } from "sonner";

export const uploadToCloudinary = async (image) => {
  try {
    const loadingId = toast.loading("Uploading image...");
    const imageData = new FormData();
    // Accept either a File or an object with .file
    const file = image?.file || image;
    imageData.append("file", file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/uploads`, {
      method: "POST",
      credentials: "include",
      body: imageData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    toast.success("Image uploaded successfully!");
    return json.url;
  } catch (err) {
    console.error("Error uploading image:", err.message);

    // Update toast to error
    toast.error("Failed to upload image. Please try again.");
    return null;
  } finally {
    // Ensure any loading toast is dismissed
    try {
      toast.dismiss();
    } catch (_) {}
  }
};
