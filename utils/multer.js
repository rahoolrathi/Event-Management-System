var multer = require("multer");
var path = require("path");

var __filename = module.filename;
var __dirname = path.dirname(__filename);



var localStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.join("uploads", "users"));
  },
  filename: function(req, file, callback) {
    var fileName = file.originalname.split(" ").join("-");
    var extension = path.extname(fileName);
    var baseName = path.basename(fileName, extension);
    callback(null, baseName + "-" + Date.now() + extension);
  },
});

var uploads = multer({
  storage: localStorage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: function(req, file, callback) {
    var FileTypes = /jpeg|jpg|png|gif|mp4|mp3|mpeg/;
    var isValidFile = FileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (isValidFile) {
      callback(null, true);
    } else {
      callback(new Error("File type not supported"), false);
    }
  },
});

module.exports = {
  uploads,
};
