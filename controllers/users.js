const User = require('../models/users.js')
const OtpCode = require('../models/otpCode.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blockedUsers=require('../models/blockedusers.js');
const { registeruservalidtions,loginValidtions,emailValidator } = require('../validations/userValidations.js')
exports.signup = async (req, res) => {

    try {
       
        let body = req.body;
        //Validating body before encrypting
        const { error } = registeruservalidtions.validate(body);
        if (error){
            res.status(422).json({
                status: 'fail',
                message: error.details[0].message,
            })}
        //Encryptying
        body.password = await bcrypt.hash(body.password, 12);

        //Stroring new user in db
        const newUser = await User.create({
            firstname: body.firstname,
            lastname: body.lastname,
            profileImage: body.profileImage,
            email: body.email,
            password: body.password
        })
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })
       ;
        res.status(201).json({
            status: 'sucess',
            message: "User added sucessfully",
            token,
            data: {
                user: newUser,


            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: "fail",
                message: "Email already exists"
            });
        }
        //console.log(error);
        return res.status(500).json({
            status: "error",
            message: "unexpected error",
            trace: error.message
        });
    }


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

exports.VerifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body
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
        //console.log(otpData.otpCode)
        if (otpData.otpCode !== otpCode) {
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
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing your request.",
            trace: error.message,
        });
    }

}

exports.Signin = async (req, res) => {
    try {
        const body = req.body;
        const { error } = loginValidtions.validate(body);
        if (error){
            res.status(422).json({
                status: 'fail',
                message: error.details[0].message,
            })}
        //console.log(req.headers)
        //Verifying user 
        let user = await User.findOne({ email: body.email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please check your email and try again.",
            });
        }
        //console.log(user.find({name:'rathi'}))

        //decrypting password
     
        let isPassword = await bcrypt.compare(body.password, user.password);
    
        if (!isPassword) {
            return res.status(400).json({
                status: "error",
                message: "Incorrect Password.",
                trace: `Password: ${isPassword} is incorrect`
            });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })
        return res.json({
            status: "success",
            message: "Login successfully !",
            token,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while processing your request.",
            trace: error.message,
        });
        

    }




}

exports.blockUser = async (req, res) => {
    try{
        const { useremail } = req.body;
        //validtions done
        const {error}=emailValidator.validate(useremail);
        if (error){
            res.status(422).json({
                status: 'fail',
                message: error.details[0].message,
        })}

        const userToBlock = await User.find({ email: useremail });
        
        if (userToBlock.length===0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        //star
        // console.log(userToBlock._id)
        const isblocked=await User.find({'$or':[{from:req.user.id,to:userToBlock._id} , {to:req.user.id,from:userToBlock._id} ]});
        if (isblocked.length!==0) {
            return res.status(400).json({
                status: 'error',
                message: 'User is already blocked'
            });
        }

        const newblocked = await blockedUsers.create({
            from: req.user.id,
            to: userToBlock._id,
        });

        res.status(201).json({
            status: 'sucess',
            message: "User blocked sucessfully",
        });

    }catch(error){
        res.status(500).json({
            status: 'error',
            message: 'Unexpected error',
            trace: error.message
        });
    }
    
};