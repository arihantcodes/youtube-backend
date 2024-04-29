import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudnary = async (localfile) => {
  try {
    if (!localfile) return null;

    const response = await cloudinary.uploader.upload(localfile, {
      resource_type: "auto",
    });
    
    // todo remove olf file from cloudnary agar user new profile send kari ho to

    fs.unlinkSync(localfile)

    return response;
  } catch (error) {
    fs.unlinkSync(localfile); //remove the temp file on mongoDB

    return null;
  }
};

export default uploadonCloudnary;
