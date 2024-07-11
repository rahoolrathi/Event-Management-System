const multer  = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'C:\\InternProjects\\RegistrationSystem\\uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  var handleMultipartData = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 100,
    },
    
  });
  
module.exports={
    handleMultipartData
}


