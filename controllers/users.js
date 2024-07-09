const User=require('../models/users.js')
const OtpCode=require('../models/otpCode.js')
const bcrypt = require('bcrypt');
exports.signup=async(req,res)=>{

    try{
        let body=req.body;
        //Validating password before encrypting
        if (!isValidPassword(body.password)) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid password. Password must be at least 8 characters long"
            });
        }
    
    //Encryptying
    body.password=await bcrypt.hash(body.password,12);

    //Stroring new user in db
    const newUser=await User.create({
        firstname:body.firstname,
        lastname:body.lastname,
        profileImage: body.profileImage,
        email:body.email,
        password:body.password
    })

    res.status(201).json({
        status:'sucess',
        message:"User added sucessfully",
        data:{
            user:newUser,
            
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
function isValidPassword(password) {
    return password.length>8
}

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        let user = await User.findOne({ email: email });
        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please check your email and try again.",
            });
        }
        //Generating otpcode
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        //Saving in db
        await OtpCode.create({ email, otpCode });

        console.log(otpCode);
        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully',
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send OTP'
        });
    }
};

exports.VerifyOTP=async (req,res)=>{
    try{
        const {email, otpCode}=req.body
        //Verifying user 
        let user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please check your email and try again.",
            });
        }
        //Verfying OTP
        let otpData = await OtpCode.findOne({ email: user.email });
        if (!otpData) {
            return res.status(404).json({
                success: false,
                message: "OTP data not found for the user. Please try again.",
            });
        }
        //if the provided oTP code matched
        console.log(otpData.otpCode)
        if (otpData.otpCode !==  otpCode) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP Code! Please try again",
            });
        }

        return res.json({
            success: true,
            message: "Your OTP has been verified!",
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing your request.",
            trace: error.message,
        });
    }

}