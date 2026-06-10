import validator from "validator";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Route for Google sign-in: verify the Google ID token, find or create the
// user, and issue our normal app JWT.
const googleLogin = async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.json({ success: false, message: "Google sign-in is not configured yet." })
        }

        const { credential } = req.body
        if (!credential) {
            return res.json({ success: false, message: "Missing Google credential" })
        }

        // Verify the token came from Google and was issued for our app.
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        const { sub: googleId, email, name } = payload

        if (!email) {
            return res.json({ success: false, message: "Google account has no email" })
        }

        // Link to an existing account by email, or create a new one.
        let user = await userModel.findOne({ email })
        if (user) {
            if (!user.googleId) {
                user.googleId = googleId
                await user.save()
            }
        } else {
            user = await new userModel({
                name: name || email.split('@')[0],
                email,
                googleId,
                password: "",
            }).save()
        }

        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Google sign-in failed" })
    }
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


export { loginUser, registerUser, adminLogin, googleLogin }