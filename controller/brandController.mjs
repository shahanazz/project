import Brand from '../models/brandModel.mjs';


// load brand
const loadBrand = async(req,res) =>{   
    try {             
        
        const brandData = await Brand.find({status:true});

        let page = 1;
        if (req.query.page) {
          page = parseInt(req.query.page, 10) || 1;
        }
    
        const limit = 5;
        const skip = (page - 1) * limit;

        const count = await Brand.countDocuments({ status: true });

        res.render('brandList' , {brands : brandData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,});

    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');
    }
}

// load add form
const loadaddBrandForm = async(req,res) =>{
    try {
        
        res.render('addBrand');
    } catch (error) {
        console.log(error.message);
        res.status(500).res.redirect('/500');
    }
}

// create a new form
const postBrand = async(req,res) =>{
    try {
       const {brandName , brandLogo } = req.body;

       const existingBrand = await Brand.findOne({ brandName: { $regex: new RegExp(`^${brandName}$`, 'i') }});

       if(existingBrand){
        console.log('Brand already exists');
        res.status(409).render('addBrand', {message : 'Brand Already Exists!!'});
       }else{


        let brand = new Brand({
            brandName,
            status : true,
        });

        const brandData = await brand.save();

        if(brandData){
            res.redirect('/admin/brand');
        }else{
            res.render('addBrand' , {message : 'Something went wrong'})
        }
       }

    } catch (error) {
        console.log(error.message);
        res.status(500).res.redirect('/500');
    }
}


// load edit brasnd form
const editBrand = async(req,res) =>{
    try {
        const id = req.query.id;
        const brandData = await Brand.findById({_id : id});

        res.render('editBrand' , {brands : brandData});
    } catch (error) {   
        console.log(error.message);
        res.status(500).render('500'); 
    }
}

// update form
const updateBrand = async(req,res) =>{
    try {

        const id = req.query.id;
        const brand = await Brand.findOne({_id : id});
        console.log(brand);

        await Brand.updateOne({_id:id},
        {$set : { brandName : req.body.brandName }});

        res.redirect('/admin/brand');
            
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');
    }
}

// delete Brand  
const deleteBrand = async(req,res) =>{
    try {
        const id = req.query.id;

        const brand = await Brand.findByIdAndUpdate(id,
            { $set : {status : false},
        });

        res.redirect('/admin/brand');

    } catch (error) {
        console.log(error.message);
        res.status(500).render('500');
    }
}

export default { 
    loadBrand,
    loadaddBrandForm,
    postBrand,
    editBrand,
    updateBrand,
    deleteBrand,
    
}