import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
    limits: { fileSize: 100 * 1024 * 1024 }, // 100mb
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video") || file.mimetype.startsWith("image")) {
          return cb(null, true)
        }
        cb(new Error("Invalid file type. Only video and image files are allowed."), false)
      }
})