import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginateImport from "mongoose-paginate-v2";

const mongoosePaginate = mongoosePaginateImport?.default || mongoosePaginateImport;

import status from "../enums/status.js";
import subCategoryModel from "./subCategory.js";

var categoryModel = new Schema(
  {
    categoryName: {
      type: String,
    },
    categoryType: {
      type: String,
      default: "PRODUCT",
    },
    categoryImage: {
      type: String,
    },
    status: {
      type: String,
      enum: [status.ACTIVE, status.BLOCK, status.DELETE],
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

categoryModel.plugin(mongoosePaginate);
const model_category = Mongoose.model("category", categoryModel);

export default model_category;

(async () => {
  let result = await Mongoose.model("category", categoryModel).find({});
  if (result.length != 0) {
    console.log("Default category data already created.");
  } else {
    var categoryData = [
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Electronics",
        categoryType: "PRODUCT",
        categoryImage:
          "https://www.91-img.com/pictures/133282-v1-apple-iphone-11-mobile-phone-large-1.jpg?tr=q-60https://res.cloudinary.com/nandkishor/image/upload/v1682676664/electronics_vjit89.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Fashion",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682676779/fashion_dp3xrb.webp",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Home & Kitchen",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682676851/home_wh90y8.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Furniture",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677042/furniture_zly2r4.avif",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Books",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677097/book_qrlzgr.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Sports",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677208/sport_zuqkxg.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Two wheeler",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677325/twowheel_ox4qrq.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Four wheeler",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677345/fourWheel_hli4kp.webp",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Pets",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677614/pets_y6sonu.jpg",
      },
      {
        _id:new Mongoose.Types.ObjectId(),
        categoryName: "Services",
        categoryType: "PRODUCT",
        categoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682677649/service_sjmycq.webp",
      },
    ];

    const ElectronicsId = categoryData.filter((fil) => {
      return fil.categoryName == "Electronics";
    })[0]._id;
    const FashionId = categoryData.filter((fil) => {
      return fil.categoryName == "Fashion";
    })[0]._id;
    const HomeKitchenId = categoryData.filter((fil) => {
      return fil.categoryName == "Home & Kitchen";
    })[0]._id;
    const FurnitureId = categoryData.filter((fil) => {
      return fil.categoryName == "Furniture";
    })[0]._id;
    const BooksId = categoryData.filter((fil) => {
      return fil.categoryName == "Books";
    })[0]._id;
    const SportsId = categoryData.filter((fil) => {
      return fil.categoryName == "Sports";
    })[0]._id;
    const TwoWheelerId = categoryData.filter((fil) => {
      return fil.categoryName == "Two wheeler";
    })[0]._id;
    const FourWheelerId = categoryData.filter((fil) => {
      return fil.categoryName == "Four wheeler";
    })[0]._id;
    const PetsId = categoryData.filter((fil) => {
      return fil.categoryName == "Pets";
    })[0]._id;
    const ServicesId = categoryData.filter((fil) => {
      return fil.categoryName == "Services";
    })[0]._id;

    var subCategoryList = [
      {
        subCategoryName: "Mobile",
        categoryId: ElectronicsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682678879/mobile1_b3jkat.jpg",
      },
      {
        subCategoryName: "Laptop",
        categoryId: ElectronicsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682678981/lapi_zdqmpw.jpg",
      },
      {
        subCategoryName: "TV",
        categoryId: ElectronicsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679039/tv_jvncgu.jpg",
      },
      {
        subCategoryName: "Charger",
        categoryId: ElectronicsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679088/charger_fiyvbb.webp",
      },
      {
        subCategoryName: "Earbuds",
        categoryId: ElectronicsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679161/earbuds_tfeytr.webp",
      },
      {
        subCategoryName: "Dining Table",
        categoryId: HomeKitchenId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679444/dining_lwuvp4.webp",
      },
      {
        subCategoryName: "Table",
        categoryId: HomeKitchenId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679514/table_gfndsl.jpg",
      },
      {
        subCategoryName: "Chair",
        categoryId: HomeKitchenId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679554/chair_sc8lsy.jpg",
      },
      {
        subCategoryName: "sofa set",
        categoryId: HomeKitchenId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679695/sofa_il7x8y.webp",
      },
      {
        subCategoryName: "Bed",
        categoryId: HomeKitchenId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679778/bed1_jsok1t.jpg",
      },
      {
        subCategoryName: "Horrer Book",
        categoryId: BooksId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686325/horror_j2viks.jpg",
      },
      {
        subCategoryName: "BioGraphy Book",
        categoryId: BooksId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686398/biography_fadhst.jpg",
      },
      {
        subCategoryName: "AutoBiography Book",
        categoryId: BooksId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686417/autobio_yuiak0.webp",
      },
      {
        subCategoryName: "Novel Book",
        categoryId: BooksId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686490/novel_aleq7n.jpg",
      },
      {
        subCategoryName: "Chapter Book",
        categoryId: BooksId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686542/chapter_jd6bry.jpg",
      },
      {
        subCategoryName: "Football",
        categoryId: SportsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686696/football_j0ksff.webp",
      },
      {
        subCategoryName: "Volleyball",
        categoryId: SportsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686714/vollyball_ks9nyu.jpg",
      },
      {
        subCategoryName: "Basketball",
        categoryId: SportsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686727/basketball_n03cbv.webp",
      },
      {
        subCategoryName: "Cricket",
        categoryId: SportsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686781/cricket_vgkqvf.jpg",
      },
      {
        subCategoryName: "Tennis",
        categoryId: SportsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682686805/tennis_zf2wyc.jpg",
      },
      {
        subCategoryName: "SuzuKi",
        categoryId: TwoWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683008752/suzuki_sgzaor.jpg",
      },
      {
        subCategoryName: "Bajaj",
        categoryId: TwoWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683008768/bajaj_t8ks8i.png",
      },
      {
        subCategoryName: "YaMaHa",
        categoryId: TwoWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683008782/yamaha_tf1icr.webp",
      },
      {
        subCategoryName: "Ducati",
        categoryId: TwoWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683008798/ducati_fgtct0.webp",
      },
      {
        subCategoryName: "Hero",
        categoryId: TwoWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683008811/hero_cqf5mv.avif",
      },
      {
        subCategoryName: "Innova",
        categoryId: FourWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683009306/innova_nlazbv.jpg",
      },
      {
        subCategoryName: "Swift",
        categoryId: FourWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683009319/swift_wrzybw.jpg",
      },
      {
        subCategoryName: "BMW",
        categoryId: FourWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683009331/bmw_bnzv7f.jpg",
      },
      {
        subCategoryName: "Audi",
        categoryId: FourWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683009347/audi_ylwoix.jpg",
      },
      {
        subCategoryName: "Mercedes",
        categoryId: FourWheelerId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683009370/mercedes_tr7mbg.jpg",
      },
      {
        subCategoryName: "Labrador",
        categoryId: PetsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010176/labra_uotbgr.jpg",
      },
      {
        subCategoryName: "Pug",
        categoryId: PetsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010186/pug_uhfdzv.jpg",
      },
      {
        subCategoryName: "Pomorian",
        categoryId: PetsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010200/pomerian_xgluc9.webp",
      },
      {
        subCategoryName: "BullDog",
        categoryId: PetsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010231/bulldog_bok7tw.jpg",
      },
      {
        subCategoryName: "German Shepherd",
        categoryId: PetsId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010245/german_a4urno.jpg",
      },
      {
        subCategoryName: "T-Shirt",
        categoryId: FashionId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010415/tshirt_wvy5mi.webp",
      },
      {
        subCategoryName: "Shirt",
        categoryId: FashionId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010424/shirt_kbxawu.jpg",
      },
      {
        subCategoryName: "Jeans",
        categoryId: FashionId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010433/jeans_jz0x7y.webp",
      },
      {
        subCategoryName: "Shoes",
        categoryId: FashionId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010442/shoe_b2jcdr.jpg",
      },
      {
        subCategoryName: "Watch",
        categoryId: FashionId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010451/watch_s2gll3.jpg",
      },
      {
        subCategoryName: "Sofa",
        categoryId: FurnitureId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679695/sofa_il7x8y.webp",
      },
      {
        subCategoryName: "Table",
        categoryId: FurnitureId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679514/table_gfndsl.jpg",
      },
      {
        subCategoryName: "Chair",
        categoryId: FurnitureId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679554/chair_sc8lsy.jpg",
      },
      {
        subCategoryName: "Bed",
        categoryId: FurnitureId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679778/bed1_jsok1t.jpg",
      },
      {
        subCategoryName: "Dining Table",
        categoryId: FurnitureId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1682679444/dining_lwuvp4.webp",
      },
      {
        subCategoryName: "Samsung",
        categoryId: ServicesId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010709/samService_p8rdzu.jpg",
      },
      {
        subCategoryName: "LG",
        categoryId: ServicesId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010717/lgService_wlhbxb.webp",
      },
      {
        subCategoryName: "Sony",
        categoryId: ServicesId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010725/sonyService_aaxrsl.webp",
      },
      {
        subCategoryName: "Panasonic",
        categoryId: ServicesId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010751/panasonicService_pwniqx.webp",
      },
      {
        subCategoryName: "Toshiba",
        categoryId: ServicesId,
        subCategoryImage:
          "https://res.cloudinary.com/nandkishor/image/upload/v1683010760/toshibaService_c3brcr.webp",
      },
    ];

    let result = await Mongoose.model("category", categoryModel).insertMany(
      categoryData
    );
    if (result) {
      await subCategoryModel.insertMany(subCategoryList);
      console.log("DEFAULT CATEGORY & SubCategory data Created.", result);
    }
  }
}).call();
