import Address from '../models/addressModel.mjs';
import User from '../models/userModel.mjs';

// load address
const loadAddress = async(req,res) =>{
    try {
        const adresssData = await Address.find({user:req.session.user_id, status : true});
        res.render("address",{ data:adresssData })
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');
    }
}

// get add address
const addAddress = async(req,res) =>{
    try {

        const user = await User.findOne({_id:req.session.user_id});
        res.render('addAddress',{user:user});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).redirect('/500');  
    }
}

const postAddAddress = async(req,res) => {
    try {
        console.log(1);
        const { username , mobile , email , landmark ,  houseName , city , state , country , pincode ,  } = req.body;

        console.log("Mobile received on server:", mobile);
            const newAdress = new Address({
                user : req.session.user_id ,
                 username :username , 
                 mobile : mobile, 
                 email :email , 
                 landmark : landmark,  
                 houseName : houseName , 
                 city : city , 
                 state : state , 
                 country : country ,
                 pincode : pincode ,
                 
             })

            const result = await newAdress.save()
        console.log(result);
         

        res.redirect("/Address")

    } catch (error) {
        console.log(error.message);
       

    }
}  


// load editaddress
const editAddress = async(req,res) =>{    
    try {    

        const addressid = req.params.id
        const address = await Address.findOne({_id:addressid});
        console.log(address);
        res.render("editAddress",{address : address});
        
    } catch (error) {
        console.log(error.message);  
 
    }
}



const postEditAddress = async(req,res) => {
    try {
        const addressId = req.params.id;
        const { username, mobile, email, houseName, landmark, city, state, country, pincode } = req.body;

        console.log(mobile);
        await Address.updateOne({ _id: addressId }, {
            $set: {
                username,
                mobile,
                email,
                houseName,
                landmark,
                city,
                state,
                country,
                pincode
            }
        });
        res.redirect("/address");
    } catch (error) {
        console.log(error.message);
        res.redirect("/500");
    }
}

// delete address
const removeAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        console.log(addressId + " address id");

        // Update address status
        await Address.updateOne({_id: addressId}, {
            $set: {
                status: false
            }
        });

        // Remove address from the user's list
        await User.updateOne({_id: req.session.user_id}, {
            $pull: {
                addresses: addressId
            }
        });

        // Send success response
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error removing address:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};







export default {
    loadAddress,
    addAddress,
    postAddAddress,
    editAddress,
    postEditAddress,
    removeAddress,
}