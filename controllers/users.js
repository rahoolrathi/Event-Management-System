const User=require('../models/users.js')
const OtpCode=require('../models/otpCode.js')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
exports.signup=async(req,res,next)=>{

    try{
        let body=req.body;
    body.password=await bcrypt.hash(body.password,12);

    const newUser=await User.create({
        firstname:body.firstname,
        lastname:body.lastname,
        profileImage: body.profileImage,
        email:body.email,
        password:body.password
    })

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    await OtpCode.create({ email:body.email, otpCode: randomCode });

    const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET)
    

    res.status(201).json({
        status:'sucess',
        message:"User added sucessfully",
        data:{
            user:newUser,
            token
        }
    });

    }catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Email already exists"
            });
        }
        console.log(error);
        return res.status(500).json({
            status: "error",
            message: "unexpected error",
            trace: error.message
        });
    }
    

}
