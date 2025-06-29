import Joi from "joi";
import  _ from 'lodash';

import response from "../../../../../assets/response.js";
import responseMessage from "../../../../../assets/responseMessage.js";


import  userServices  from "../../services/user.js";
const { findCount } = userServices;

import  productServices  from "../../services/product.js";
const { countProduct } = productServices;



import status from "../../../../enums/status.js";
import userType from "../../../../enums/userType.js";


async function getMonthlyData() {
  let vendorQuery = [];
  for (let i = 0; i < 12; i++) {
    let monthNumber = new Date(new Date().setMonth(i));
    let firstDayOfMonth = new Date(
      new Date(
        new Date(
          new Date(monthNumber.getFullYear(), monthNumber.getMonth(), 1)
        ).toISOString()
      ).setDate(
        new Date(
          new Date(
            new Date(monthNumber.getFullYear(), monthNumber.getMonth(), 1)
          ).toISOString()
        ).getDate() + 1
      )
    ).toISOString();
    firstDayOfMonth = firstDayOfMonth.split("T")[0];
    firstDayOfMonth = firstDayOfMonth.concat("T06:30:00.000Z");

    let lastDayOfMonth = new Date(
      new Date(
        new Date(
          new Date(monthNumber.getFullYear(), monthNumber.getMonth() + 1, 0)
        ).toISOString()
      ).setDate(
        new Date(
          new Date(
            new Date(monthNumber.getFullYear(), monthNumber.getMonth() + 1, 0)
          ).toISOString()
        ).getDate() + 1
      )
    ).toISOString();
    lastDayOfMonth = lastDayOfMonth.split("T")[0];
    lastDayOfMonth = lastDayOfMonth.concat("T18:30:00.000Z");

    let query1 = {
      $and: [
        { createdAt: { $gte: new Date(firstDayOfMonth) } },
        { createdAt: { $lte: new Date(lastDayOfMonth) } },
        { status: status.ACTIVE },
      ],
    };
    vendorQuery.push(query1);
  }
  const [
    bJan,
    bFeb,
    bMarch,
    bApril,
    bMay,
    bJune,
    bJuly,
    bAug,
    bSept,
    bOct,
    bNov,
    bDec,
  ] = await Promise.all([
    countProduct(vendorQuery[0]),
    countProduct(vendorQuery[1]),
    countProduct(vendorQuery[2]),
    countProduct(vendorQuery[3]),
    countProduct(vendorQuery[4]),
    countProduct(vendorQuery[5]),
    countProduct(vendorQuery[6]),
    countProduct(vendorQuery[7]),
    countProduct(vendorQuery[8]),
    countProduct(vendorQuery[9]),
    countProduct(vendorQuery[10]),
    countProduct(vendorQuery[11]),
  ]);
  return [
    { Month: "January", countProduct: bJan },
    { Month: "February", countProduct: bFeb },
    { Month: "March", countProduct: bMarch },
    { Month: "April", countProduct: bApril },
    { Month: "May", countProduct: bMay },
    { Month: "June", countProduct: bJune },
    { Month: "July", countProduct: bJuly },
    { Month: "August", countProduct: bAug },
    { Month: "September", countProduct: bSept },
    { Month: "October", countProduct: bOct },
    { Month: "November", countProduct: bNov },
    { Month: "December", countProduct: bDec },
  ];
}

async function getWeeklyData() {
  const today = new Date();
  const last7Days = [];

  for (let i = 0; i < 7; i++) {
    const newDate = new Date();
    newDate.setDate(today.getDate() - i);
    last7Days.unshift(newDate);
  }

  const dayOfWeekData = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (let date of last7Days) {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: status.ACTIVE,
    };

    const res = await countProduct(query);
    dayOfWeekData[dayOfWeek].push({
      countProduct: res,
      date: date.toISOString(),
    });
  }

  return Object.entries(dayOfWeekData).map(([dayOfWeek, data]) => ({
    dayOfWeek,
    data,
  }));
}

async function getYearlyData() {
  var date = new Date(),
    years = [],
    year = date.getFullYear();

  for (var i = year; year - 5 < i; i--) {
    years.push(i);
  }

  years.sort((a, b) => {
    return a - b;
  });

  let vendorQuery = [];
  for (let i = 0; i < 5; i++) {
    const firstDayOfMonth = new Date(years[i], 0, 1);
    const lastDayOfMonth = new Date(years[i], 11, 31);

    let query = {
      $and: [
        { createdAt: { $gte: new Date(firstDayOfMonth) } },
        { createdAt: { $lte: new Date(lastDayOfMonth) } },
        { status: status.ACTIVE },
      ],
    };
    vendorQuery.push({ query: query, year: years[i] });
  }

  const yearlyData = await Promise.all(
    vendorQuery.map(async (ele) => {
      const res = await countProduct(ele.query);
      return { countProduct: res, Year: ele.year };
    })
  );
  return yearlyData;
}

async function getUsersWeeklyData() {
  const today = new Date();
  const last7Days = [];

  for (let i = 0; i < 7; i++) {
    const newDate = new Date();
    newDate.setDate(today.getDate() - i);
    last7Days.unshift(newDate);
  }

  const dayOfWeekData = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const currentDate of last7Days) {
    const dayOfWeek = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: status.ACTIVE,
      userType: userType.USER,
    };

    const res = await findCount(query);

    dayOfWeekData[dayOfWeek].push({
      userCount: res,
      date: currentDate.toISOString(),
    });
  }

  return Object.entries(dayOfWeekData).map(([dayOfWeek, data]) => ({
    dayOfWeek,
    data,
  }));
}

async function getUsersMonthlyData() {
  const today = new Date();
  const thisYear = today.getFullYear();

  let vendorQuery = [];
  for (let i = 0; i < 12; i++) {
    const firstDayOfMonth = new Date(thisYear, i, 1);
    const lastDayOfMonth = new Date(thisYear, i + 1, 0);

    let query = {
      $and: [
        { createdAt: { $gte: new Date(firstDayOfMonth.setHours(0, 0, 0, 0)) } },
        {
          createdAt: {
            $lte: new Date(lastDayOfMonth.setHours(23, 59, 59, 999)),
          },
        },
        { status: status.ACTIVE },
        { userType: userType.USER },
      ],
    };
    vendorQuery.push({ query, month: i + 1 });
  }

  const monthlyData = await Promise.all(
    vendorQuery.map(async (ele) => {
      const res = await findCount(ele.query);
      return { month: getMonthName(ele.month), userCount: res };
    })
  );
  return monthlyData;
}

function getMonthName(monthNumber) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
}

async function getUsersYearlyData() {
  const today = new Date();
  const thisYear = today.getFullYear();

  const years = [];
  for (let i = thisYear; thisYear - 5 < i; i--) {
    years.push(i);
  }

  years.sort((a, b) => a - b);

  let vendorQuery = [];
  for (let i = 0; i < 5; i++) {
    const firstDayOfYear = new Date(years[i], 0, 1);
    const lastDayOfYear = new Date(years[i], 11, 31);

    let query = {
      $and: [
        { createdAt: { $gte: new Date(firstDayOfYear.setHours(0, 0, 0, 0)) } },
        {
          createdAt: {
            $lte: new Date(lastDayOfYear.setHours(23, 59, 59, 999)),
          },
        },
        { status: status.ACTIVE },
        { userType: userType.USER },
      ],
    };
    vendorQuery.push({ query, year: years[i] });
  }

  const yearlyData = await Promise.all(
    vendorQuery.map(async (ele) => {
      const res = await findCount(ele.query);
      return { year: ele.year, userCount: res };
    })
  );
  return yearlyData;
}


export class chartController {
  //**************************  CHARTS management Start *************************************************/
  async itemsAdded(req, res, next) {
    const validationSchema = Joi.object({
      type: Joi.string().valid("Monthly", "Weekly", "Yearly").required(),
    });
  
    try {

      const { type } = await validationSchema.validateAsync(req.query);
  
      const dataMap = {
        Monthly: getMonthlyData,
        Weekly: getWeeklyData,
        Yearly: getYearlyData,
      };
  
      const getData = dataMap[type];
      const obj = await getData();
  
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (err) {
      console.error("❌ [itemsAdded] Error:", err);
      res.status(500).json({
        responseCode: 500,
        responseMessage: "Internal server error in itemsAdded",
      });
    }
  }
  
  async userLog(req, res, next) {
    
    const validationSchema = Joi.object({
      type: Joi.string().valid("Weekly", "Monthly", "Yearly").required(),
    });
  
    try {
     

      const { type } = await validationSchema.validateAsync(req.query);
  
      const logMap = {
        Weekly: getUsersWeeklyData,
        Monthly: getUsersMonthlyData,
        Yearly: getUsersYearlyData,
      };
  
      const getData = logMap[type];
      const obj = await getData();
  
      return res.json(new response(obj, responseMessage.DATA_FOUND));
    } catch (error) {
      console.error("❌ Error in userLog:", error.message, error.stack);
      return next(error);
    }
    
  }
  
}

export default new chartController();


