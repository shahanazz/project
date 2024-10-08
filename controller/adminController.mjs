import User from '../models/userModel.mjs';
import Product from '../models/productModel.mjs';
import Order from '../models/orderModel.mjs';
import Coupon from '../models/couponModel.mjs';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';

// load login
const loadLogin = asyncHandler( async(req,res) =>{
    try {
        
      res.render('login');

    } catch (error) {
        console.log(error.message);
    }
})

// verify login
const verifyLogin = asyncHandler( async(req,res) =>{

    try {
        
        const {email,password} = req.body;
        const userData = await User.findOne({email:email});
        console.log(email,password);
        console.log(userData);

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);
            console.log(passwordMatch);
            if(passwordMatch){
               
                if(userData.role === 'admin'){
                    req.session.admin_id = userData._id;

                    res.redirect('/admin/home');
                }else{
                    res.render('login',{message:'Password is incorrect'}); 

                }

            }else{
                res.render('login',{message:'Password is incorrect'});
            }
        }else{
            res.render('login',{message:'Email or password is incorrect'});
        }

    } catch (error) {
        console.log(error.message);
    }

});

// loadHome
// const loadHome = asyncHandler(async (req,res) =>{
//     try {
//         res.render('home');
//     } catch (error) {
//         console.log(error.message);
//     } 
// });
const loadHome = async (req, res) => {
    try {
      
      const { year = new Date().getFullYear(), month } = req.query;

      
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
  
    
      let matchCondition = {
        createdAt: { $gte: startDate, $lt: endDate },
        orderStatus: { $ne: "Cancelled" }
      };
  

      if (month) {
        const startMonthDate = new Date(year, month - 1, 1);
        const endMonthDate = new Date(year, month, 1);
        matchCondition.createdAt = { $gte: startMonthDate, $lt: endMonthDate };
      }
  
     
      let salesByYear = await Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: { $dateToString: { format: "%m", date: "$createdAt" } },
            total: { $sum: "$totalPrice" }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      // sales data for each month (default to 0 if no data available)
      let salesData = Array(12).fill(0);
      salesByYear.forEach(sale => {
        let monthIndex = parseInt(sale._id) - 1;  
        salesData[monthIndex] = sale.total;
      });

      const totalAmount = await Order.aggregate([
        { $match: { 'orderStatus': { $in: ['Confirmed', 'Delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, discount: { $sum: '$discount' }, coupon: { $sum: '$coupon' } } }
      ]);

    
      const usersCount = await User.countDocuments({});

    //   const latestOrder = await Order.find()
    //   .sort({ createdAt: -1 })
    //   .count()
    //   .populate("products.productId");

    //   console.log(latestOrder);
  
      // Render the view with sales data
      res.render("home", {
        salesData,
        totalAmount,
        usersCount

        // other data  
      });
    } catch (error) {
      res.redirect("/500");
      console.log(error.message);
    }
  };
  

// const loadHome = async (req, res) => {
//   try {
    
//     let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);

//     // Aggregate sales data by month
//     let salesByYear = await Order.aggregate([
//         {
//             $match: {
//                 createdAt: { $gte: currentSalesYear },
//                 orderStatus: { $ne: "Cancelled" }
//             }
//         },
//         {
//             $group: {
//                 _id: { $dateToString: { format: "%m", date: "$createdAt" } },
//                 total: { $sum: "$totalPrice" }
//             }
//         },
//         { $sort: { _id: 1 } }
//     ]);

   
//     let salesData = Array(12).fill(0);

   
//     salesByYear.forEach(sale => {
//         let monthIndex = parseInt(sale._id) - 1; 
//         salesData[monthIndex] = sale.total;
//     });

     
//       res.render("home", {
//           salesData,
//           // other data
//       });
//   } catch (error) {
//       res.redirect("/500");
//       console.log(error.message);
//   }
// };


const getSalesData =  async (req, res) => {
    try {
        const filter  = req.query.filter;
        let matchCondition = {};
        let groupBy = "";
        console.log('hello sales');
        switch (filter) {
            case 'year':
                matchCondition = { $gte: new Date(new Date().getFullYear(), 0, 1) };
                groupBy = { $dateToString: { format: "%m", date: "$createdAt" } }; // month
                break;
            case 'month':
                matchCondition = { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };
                groupBy = { $dateToString: { format: "%d", date: "$createdAt" } }; //day
                break;
            case 'week':
                let currentDate = new Date();
                let firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
                matchCondition = { $gte: new Date(new Date().setDate(firstDayOfWeek)) };
                groupBy = { $dateToString: { format: "%w", date: "$createdAt" } }; //day of week
                break;
        }

        let salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: matchCondition,
                    orderStatus: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        let salesArray;
        switch (filter) {
            case 'year':
                salesArray = Array(12).fill(0); // 12 months
                break;
            case 'month':
                salesArray = Array(31).fill(0); // 31 days 
                break;
            case 'week':
                salesArray = Array(7).fill(0); // 7 days in week
                break;
        }

        salesData.forEach(sale => {
            let index = parseInt(sale._id) - 1;
            salesArray[index] = sale.total;
        });

        res.json({ salesData: salesArray });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



// admin logout
const logout = asyncHandler(async (req,res) =>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
});


// show users list

const loadUserList = asyncHandler(async (req, res) => {
    try {
      let page = 1;
      if (req.query.page) {
        page = parseInt(req.query.page, 10) || 1;
      }
  
      const limit = 5;
      const skip = (page - 1) * limit;
  
      const UsersData = await User.find({ role: 'user' })
        .limit(limit)
        .skip(skip)
        .exec();
  
      const count = await User.countDocuments({ role: 'user' });
  
      res.render('usersList', {
        users: UsersData,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  
// const loadUserList =asyncHandler(async(req,res) =>{
//     try {  
//         const UsersData = await User.find({role: 'user'});
//         res.render('usersList',{ users : UsersData});
  
  
//     } catch (error) {
//         console.log(error.message);
//     }
// });

// user blocked
const blockUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
        res.json({ success: true }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

const unBlockUser = asyncHandler(async (req, res) => {
    try {
        console.log(req.params.id);
        await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
        res.json({ success: true }); 
    } catch (error) {
        res.json({ success: false, message: error.message }); 
    }
}); 


// load sales report
const loadSalesReport = async (req, res) => {
  try {
   
    // const totalAmount = await Order.aggregate([
    //   { $match: { 'orderStatus': { $in: ['Confirmed', 'Delivered'] } } },
    //   { 
    //     $group: { 
    //       _id: null, 
    //       total: { $sum: '$totalPrice' }, 
    //       discount: { $sum: { $ifNull: ['$discount', 0] } }, 
    //       coupon: { $sum: { $ifNull: ['$coupon', 0] } } 
    //     }
    //   }
    // ]);

    const totalAmount = await Order.aggregate([
      { 
        $match: { 
          'orderStatus': { $in: ['Confirmed', 'Delivered'] } 
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }, 
          totalDiscount: { $sum: "$discount" },  
          totalCoupon: { $sum: "$coupon" },  
          totalOffer: { $sum: "$products.productoffer" }
        }
      }
    ]);

    console.log('Total Amount: ---', totalAmount);
   
    const products = await Order.find({ "orderStatus": { $in: ["Confirmed", "Delivered"] } })
      .populate("userId")
      .populate("products.productId")
      .sort({ date: -1 });

      // console.log(products);   
    const salesCount = await Order.countDocuments({ "orderStatus": { $in: ["Confirmed", "Delivered"] } });

    
    const totalOrderedProducts = await Order.countDocuments({'orderStatus' : "Confirmed"});

    // overall discount
    const overallDiscount = totalAmount[0] ? totalAmount[0].discount + totalAmount[0].couponDiscount : 0;

    console.log('overall discount --->',overallDiscount);


   
    res.render("salesReport", {
      totalAmount,
      products,
      salesCount,
      overallDiscount,
      totalOrderedProducts  
    });
    
  } catch (error) {
    console.log(error.message);
    res.status(500).redirect('/500'); 
  }
};
   


// sort sales report
const sortSalesReport = async (req, res, next) => {
  const { fromDate, toDate, filter } = req.body;

  try {

    let matchCondition = { 'orderStatus': { $in: ['Confirmed', 'Delivered'] } };

 
    if (filter === 'custom') {
      matchCondition.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    } else {
      let dateCondition;
      const today = new Date();
      switch (filter) {
        case 'daily':
          dateCondition = { $gte: new Date(today.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) };
          break;
        case 'weekly':
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          dateCondition = { $gte: new Date(startOfWeek.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) };
          break;
        case 'monthly':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          dateCondition = { $gte: new Date(startOfMonth.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) };
          break;
        case 'yearly':
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          dateCondition = { $gte: new Date(startOfYear.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) };
          break;
      }
      matchCondition.date = dateCondition;
    }

    // sales report data
    const totalAmount = await Order.aggregate([
      { $match: matchCondition },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, discount: { $sum: '$discount' }, coupon: { $sum: '$coupon' } } }
    ]);

    const products = await Order.find(matchCondition)
      .populate('userId')
      .populate('products.productId');

    const salesCount = await Order.countDocuments({ "orderStatus": "Delivered", ...matchCondition });
    const overallDiscount = totalAmount[0] ? totalAmount[0].discount : 0;

    res.render('salesReport', {
      totalAmount,
      products,
      salesCount,
      overallDiscount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
};




  const loadCoupon = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        res.render("coupon", { coupons: findCoupons });
    } catch (error) {
        console.log(error.message);   
    }
}

const createCoupon = async (req, res) => {
    try {

        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + 'T00:00:00'),
            endDate: new Date(req.body.endDate + 'T00:00:00'),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice)
        };

        // const existingCoupon = await Coupon.findOne({ name: data.couponName });
        // if (existingCoupon) {
        //     // Render the coupon form with an error message
        //     return res.render('coupon', {
        //         message: 'Coupon name already exists. Please choose a different name.',
        //     });
        // }
       
        const newCoupon = new Coupon({
            name: data.couponName,
            createdOn: data.startDate,
            expireOn: data.endDate,
            offerPrice: data.offerPrice,
            minimumPrice: data.minimumPrice
        })

        await newCoupon.save()
            .then(data => console.log(data))

        res.redirect("/admin/coupon")
  
        console.log(data);

    } catch (error) {
        console.log(error.message);
    }
}

// top ratings

const top10Category = async (req, res) => {
  try {
      const topCategories = await Order.aggregate([
          { $unwind: "$products" }, 
          {
              $lookup: {
                  from: "products",
                  localField: "products.productId",
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" }, 
          {
              $group: {
                  _id: "$productDetails.category", // Group by category
                  totalQuantitySold: { $sum: "$products.quantity" } 
              }
          },
          { $sort: { totalQuantitySold: -1 } }, 
          { $limit: 10 },
          {
              $lookup: {
                  from: "categories",
                  localField: "_id",
                  foreignField: "_id",
                  as: "categoryDetails"
              }
          },
          { $unwind: "$categoryDetails" }, 
          { $project: { _id: 0, categoryName: "$categoryDetails.category", totalQuantitySold: 1 } } 
      ]);

      res.status(200).render('popularCategory', { topCategories });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const top10Brand = async (req, res) => {
  try {
      const topBrands = await Order.aggregate([  
          { $unwind: "$products" }, 
          {
              $lookup: {
                  from: "products",
                  localField: "products.productId",
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" }, 
          {
              $group: {
                  _id: "$productDetails.brand", 
                  totalQuantitySold: { $sum: "$products.quantity" } 
              }
          },
          { $sort: { totalQuantitySold: -1 } }, 
          { $limit: 10 }, 
          {
              $lookup: {
                  from: "brands",
                  localField: "_id",
                  foreignField: "_id",
                  as: "brandDetails"
              }
          },
          { $unwind: "$brandDetails" }, 
          { $project: { _id: 0, brandName: "$brandDetails.brandName", totalQuantitySold: 1 } } 
      ]);

      res.status(200).render('popularBrand', { topBrands });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const top10Product = async (req, res) => {
  try {
      const topProducts = await Order.aggregate([
          { $unwind: "$products" }, 
          { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } }, // group by productId and sum quantities
          { $sort: { totalQuantity: -1 } }, 
          { $limit: 10 }, 
          {
              $lookup: {
                  from: "products",
                  localField: "_id",          
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" }, 
          {
              $project: {
                  _id: 0,
                  productName: "$productDetails.productname", 
                  totalQuantity: 1,
                  availableQuantity : "$productDetails.quantity",
                 image: "$productDetails.image" 
              }
          }
      ]);

      res.status(200).render('popularProduct', { topProducts });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


  

export default {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    loadUserList,
    blockUser,
    unBlockUser,
    loadSalesReport,
    sortSalesReport,
    loadCoupon,
    createCoupon,
    top10Brand,
    top10Category,
    top10Product,
    getSalesData
}