import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, generateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";

export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();
    const validationSchema = zSchema.pick({ email: true });
    const validatedData = validationSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(
        false,
        401,
        "Invalid or missing input fields",
        validatedData.error
      );
    }
    const { email } = validatedData.data;
    const getUser = await UserModel.findOne({ email });
    if (!getUser) {
      return response(false, 404, "User not found");
    }
    //delete old otps
    await OTPModel.deleteMany({ email });
    const otp = generateOTP();
    const newOtpData = await OTPModel({
      email,
      otp,
    });

    await newOtpData.save();

    const otpSendStatus = await sendMail(
      "Your login verification code",
      email,
      otpEmail(otp)
    );

    if (!otpSendStatus) {
      return response(false, 400, "Failed to send otp");
    }

    return response(true, 200, "OTP sent successfully");
  } catch (error) {
    return catchError(error);
  }
}
