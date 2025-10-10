// const { v2: cloudinary } = require("cloudinary");
// const fs = require("fs");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log("Response from cloudinary: ", response.url);
//     return response;
//   } catch (error) {
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

// moudule.exports = { uploadOnCloudinary };
