import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, code } = await request.json()

        const decodedUsername = decodeURIComponent(username)

        console.log("username :" + username);
        console.log("decodedUsername:" + decodedUsername);

        const user = await UserModel.findOne({ username: decodedUsername })
        console.log("Get user for the routes::" + user);

        if (!user) {
            return Response.json({
                success: false,
                message: "user not found"
            }, { status: 404 })
        }

        const isCodeValid = user.verifyCode === code
        console.log("this is code are isCodeValid :", isCodeValid);

        // const isCodeNotExpire = new Date(user.verifyCode) > new Date()

        const isCodeNotExpire = new Date(user.verifyCodeExpiry) > new Date();
        console.log("this is code are not isCodeNotExpire :", isCodeNotExpire);

        if (isCodeValid && isCodeNotExpire) {
            user.isVerified = true
            await user.save()

            return Response.json({
                success: true,
                message: "account verified success"
            }, { status: 200 })
        } else if (!isCodeNotExpire) {
            return Response.json({
                success: false,
                message: "verification code has expired please signup again to get a new code"
            }, { status: 402 })
        } else {
            return Response.json({
                success: false,
                message: "Incorrect Verification code"
            }, { status: 400 })
        }

    } catch (error) {
        console.error("Error verifying user", error)
        return Response.json({
            success: false,
            message: "Error verifying user"
        }, { status: 500 })
    }
}

// Add this GET handler to your existing route.ts
export async function GET(request: Request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
  
    try {
      const user = await UserModel.findOne({ 
        username: decodeURIComponent(username || '')
      });
  
      if (!user) return Response.json({ code: null }, { status: 404 });
      if (user.isVerified) return Response.json({ code: null }, { status: 400 });
  
      return Response.json({
        code: user.verifyCode
      }, { status: 200 });
  
    } catch (error) {
      return Response.json({ code: null }, { status: 500 });
    }
  }