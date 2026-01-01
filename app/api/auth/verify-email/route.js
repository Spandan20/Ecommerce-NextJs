import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
import { jwtVerify } from "jose";

export async function POST(request) {
  try {
    await connectDB();
    const { token } = await request.json();

    if (!token) {
      return response(false, 400, "Missing Token.");
    }
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    const userID = payload.userID;
    const user = await UserModel.findById(userID);

    if (!user) {
      return response(false, 404, "User not found");
    }
    user.isEmailVerified = true;
    await user.save();

    return response(true, 200, "Email Verification success");
  } catch (error) {
    return catchError(error);
  }
}
