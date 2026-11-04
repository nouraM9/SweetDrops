const Product = require("./../models/product");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const multer = require("multer");

const sharp = require("sharp");

// Store in memory for image processing
const multerStorage = multer.memoryStorage();

// Filter images only
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an image! Please upload only images.", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Handle multiple fields
exports.uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeProductImages = async (req, res, next) => {
  try {
    const timestamp = Date.now();

    // Product cover image
    if (req.files?.imageCover?.length) {
      req.body.imageCover = `product-${timestamp}-cover.png`;

      await sharp(req.files.imageCover[0].buffer)
        .rotate() // respects phone image orientation
        .png()
        .toFile(`public/img/products/${req.body.imageCover}`);
    }

    // Additional product images
    if (req.files?.images?.length) {
      req.body.images = [];

      await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `product-${timestamp}-${i + 1}.png`;

          await sharp(file.buffer)
            .rotate()
            .png()
            .toFile(`public/img/products/${filename}`);

          req.body.images.push(filename);
        }),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = factory.getAllOne(Product);
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.getProduct = factory.getOne(Product);
