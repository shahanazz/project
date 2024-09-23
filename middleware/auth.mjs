
// const isLogin = async(req,res,next) =>{
//     try {
        
//       if(req.session.user_id){
//         next();
//       }else{
//         // res.locals.userLoggedIn = req.session.user;
//         res.redirect('/login');  
//       }
      
//     } catch (error) {
//         console.log(error.message);
//     }
// }

import User from '../models/userModel.mjs';


const isLogin = async (req, res, next) => {
  try {
      if (req.session.user_id) {
          // Fetch user details from the database
          const user = await User.findById(req.session.user_id);

          if (user) {
              if (user.isBlocked) {
                  // Destroy session if user is blocked
                  req.session.destroy((err) => {
                      if (err) {
                          console.log('Error destroying session:', err);
                      }
                     
                      res.redirect('/login?message=Your%20account%20is%20blocked%20by%20the%20admin');
                  });
              } else {
                
                  res.locals.userLoggedIn = user; // Optional: Set user data in res.locals for use in views
                  next();
              }
          } else {
              
              res.redirect('/login');
          }
      } else {
          
          res.redirect('/login');
      }
  } catch (error) {
      console.log(error.message);
     
      res.status(500).send('Server error');
  }
};


// logout user
const isLogout = async(req,res,next) =>{
    try {
        
      if(req.session.user_id){
        res.redirect('/home'); 
      }else{
        next();
      }
      
    } catch (error) {
        console.log(error.message);
    }
}

function checkIfBlocked(req, res, next) {
  if (req.user && req.user.isBlocked) {
      return res.redirect('/login?message=Your%20account%20is%20blocked%20by%20the%20admin');
  }
  next();
}

const checkBlockStatus = async(req,res) =>{
  try {
    if(!req.user){
      return res.redirect('/');      
    } 

    const user = await User.findById(req.user._id);
    if (!user.isBlocked) {
      return res.status(403).render('login',{ message : 'Your account has been blocked. Please contact admin.'});
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}



export default  {
    isLogin,
    isLogout,
    checkBlockStatus,
    checkIfBlocked
}