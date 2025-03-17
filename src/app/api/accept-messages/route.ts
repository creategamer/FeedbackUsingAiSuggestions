// import { getServerSession } from "next-auth";
import { getServerSession } from 'next-auth/next';
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not autheticated"
        }, { status: 401 })
    }

    const userId = user._id


    const { acceptMessages } = await request.json()


    try {
        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )

        if (!updateUser) {
            return Response.json({
                success: false,
                message: "Unable to find user to update message acceptance status"
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: "message accpetnace update successfuly",
            updateUser
        }, { status: 200 })

    } catch (error) {
        console.log("failed to update user status to accept messages");
        return Response.json({
            success: false,
            message: "failed to update user status to accept messages"
        }, { status: 500 })
    }
}


// export async function GET(request: Request) {
//     await dbConnect()

//     const session = await getServerSession(authOptions)
//     const user: User = session?.user as User

//     if (!session || !session.user) {
//         return Response.json({
//             success: false,
//             message: "not autheticated"
//         }, { status: 401 })
//     }

//     const userId = user._id
//     console.log("accept messages in the userId:", userId);

//     try {
//         console.log("accept messages in the userId in try catch:", userId);

//         const foundUser = await UserModel.findById({ userId })

//         console.log("accept messages in the userId:", userId);
//         console.log("accept messages in the foundUser:", foundUser);

//         if (!foundUser) {
//             return Response.json({
//                 success: false,
//                 message: "failed to found user"
//             }, { status: 404 })
//         }

//         return Response.json({
//             success: true,
//             isAcceptingMessages: foundUser.isAcceptingMessage
//         }, { status: 200 })

//     } catch (error) {
//         // console.error('Error retrieving message acceptance status:', error);
//         return Response.json({
//             success: false,
//             message: "error in getting accepting messages"
//         }, { status: 500 })

//     }
// }


export async function GET(request: Request) {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Check if the user is authenticated
    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    try {
        // Retrieve the user from the database using the ID
        const foundUser = await UserModel.findById(user._id);

        if (!foundUser) {
            // User not found
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Return the user's message acceptance status
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
}