import Category from '../models/categoryModel.mjs';
import asyncHandler from 'express-async-handler';


// load category
const loadCategory = asyncHandler(async (req, res) => {
  try {
      let page = 1;
      if (req.query.page) {
          page = parseInt(req.query.page, 10) || 1;
      }

      const limit = 5;
      const skip = (page - 1) * limit;

      const categoryData = await Category.find({ status: true })
          .limit(limit)
          .skip(skip)
          .exec();

      const count = await Category.countDocuments({ status: true });

      res.render('categoryList', {
          categories: categoryData,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
  }
});


// load add create category
const loadAddCategory = asyncHandler(async(req,res) =>{
    try {
        res.render('addCategory');
    } catch (error) {
        console.log(error.message);
    }
})

// add category
const addCategory = asyncHandler(async (req, res) => {
    try {
      const { category, description, categoryOffer } = req.body;
  
      
      const trimmedCategory = category ? category.trim() : "";
  
      if (!trimmedCategory) {
        return res.status(400).render('addCategory', { message: "Please enter a valid category name" });
      }
  
      
      const existingCategory = await Category.findOne({ category: trimmedCategory });
      if (existingCategory) {
        return res.status(400).render('addCategory', { message: "Category already exists" });
      }
  
      const newCategory = new Category({
        category: trimmedCategory,
        description: description ? description.trim() : "",
        status: true,
        categoryOffer: categoryOffer ? categoryOffer.trim() : ""
      });
  
      const catData = await newCategory.save();
      console.log(catData);
      if (catData) {
        return res.redirect('/admin/category');
      } else {
        return res.status(500).render('addCategory', { message: 'Something went wrong' });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).render('addCategory', { message: 'Server error, please try again later' });
    }
  });
  

// load edit category
const loadEditCategory = asyncHandler(async(req, res) => {
  try {       
      const id = req.query.id;   
      if (!id) {
          console.log('id is undefined'); 
          return res.redirect('/admin/category');
      }

      const categoryData = await Category.findById({ _id: id });
      
      if (categoryData) {
          res.render('editCategory', { categories: categoryData, message: req.query.message || undefined });
      } else {
          res.redirect('/admin/category');
      }
  } catch (error) {
      console.log(error.message);
      res.redirect('/admin/category');
  } 
});

// edit category
// const updateCategory = async (req, res) => {
//   try {
//       const categoryId = req.body.id;
//       const category = await Category.findOne({ _id: categoryId });
     
//       if (!category) {
//           return res.status(404).render('editCategory',{message:'Category not found'});
//       }

//       const updateData = {
//           name: req.body.category,
//           description: req.body.categoryDescription,
//           offer: req.body.categoryOffer,
//       };

//       const result = await Category.updateOne({ _id: categoryId }, { $set: updateData }, { new: true });

//       res.redirect('/admin/category');
//   } catch (error) {
//       console.log(error.message);
//       res.status(500).send('Internal Server Error');
//   }
// };


const updateCategory = asyncHandler(async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    if (!id) {
      console.log('No ID provided in query parameters.');
      return res.redirect('/admin/category');
    }

    const { category, description, categoryOffer } = req.body;

    // Check if the category name already exists (excluding the current document)
    const existingCategory = await Category.findOne({
      category: category,
      _id: { $ne: id }
    });

    if (existingCategory) {
      console.log('Category already exists:', existingCategory);
      return res.status(400).render('editCategory', { message: "Category already exists", categories: { _id: id, category, description, categoryOffer } });
    }

    // Update the document
    const categoryData = await Category.findByIdAndUpdate(
      id, // Document ID
      {
        $set: {
          category: category,
          description: description ? description.trim() : "",
          categoryOffer: categoryOffer ? categoryOffer.trim() : ""
        }
      },
      { new: true, runValidators: true } // Return the updated document and validate
    );

    console.log('Updated Category Data:', categoryData);

    if (categoryData) {
      return res.redirect('/admin/category');
    } else {
      return res.status(500).render('editCategory', { message: 'Something went wrong', categories: { _id: id, category, description, categoryOffer } });
    }
  } catch (error) {
    console.log('Error Message:', error.message);
    return res.status(500).render('editCategory', { message: 'Server error, please try again later', categories: { _id: id, category, description, categoryOffer } });
  }
});

  

// delete category
const deletecategory= async(req,res)=>{
    try {
        
        const id = req.query.id;
        console.log(id);
        
        const categoryData = await Category.findByIdAndUpdate(id,
            { $set : {status : false},
        });
   

        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
} 


export default {
    loadCategory,
    loadAddCategory,
    addCategory,
    loadEditCategory,
    updateCategory,
    deletecategory,
}