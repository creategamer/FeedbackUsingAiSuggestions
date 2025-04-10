import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcryptjs from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true })

        console.log("user details");
        console.log(username, email, password);

        console.log("existing user verified by username", existingUserVerifiedByUsername);


        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "username already taken"
            }, { status: 400 })
        }

        const exisingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (exisingUserByEmail) {
            if (exisingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "user already exits with this emails"
                }, { status: 400 })
            } else {
                const hashedPassword = await bcryptjs.hash(password, 10)
                exisingUserByEmail.password = hashedPassword;
                exisingUserByEmail.verifyCode = verifyCode;
                exisingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await exisingUserByEmail.save()
            }
        } else {
            const hashPassword = await bcryptjs.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = new UserModel({
                username,
                email,
                password: hashPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save()
        }

        //send verifications email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        return Response.json({
            success: true,
            message: "User registered successfully please verify your email"
        }, { status: 201 })

    } catch (error) {
        console.error('error registering user ', error)
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}