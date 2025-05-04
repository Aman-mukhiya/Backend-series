import { v2 as cloudinary } from "cloudinary"
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log(`control reached at the top of the upload \n`)
const uploadOnCloudinary = async ( localFilePath ) => {
    try {
        if (!localFilePath) return null;
        //upload the file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // console.log(`This is the full respones log ${response}`)

        // file has been uploaded succefully
        //console.log("File has been upploaded on cloudinary "+ response.url)
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)// Unlink -> delete, Sync -> move forward only after delete
        return null;
    }
}

export { uploadOnCloudinary }