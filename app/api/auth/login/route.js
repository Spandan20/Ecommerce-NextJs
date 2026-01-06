import { emailVerificationLink } from "@/email/emailVerification";
import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, generateOTP, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import z from "zod";

export async function POST(request) {
  try {
    await connectDB();
    const payload = await request.json();
    const validatedSchema = zSchema
      .pick({
        email: true,
      })
      .extend({
        password: z.string(),
      });

    const validatedData = validatedSchema.safeParse(payload);
    if (!validatedData.success) {
      return response(false, 401, "Invalid or missing input fields");
    }

    const { email, password } = validatedData.data;

    //get user data
    const getUser = await UserModel.findOne({ deletedAt: null, email }).select(
      "+password"
    );

    if (!getUser) {
      return response(false, 404, "User not found");
    }

    if (!getUser.isEmailVerified) {
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const token = await new SignJWT({
        userID: getUser._id.toString(),
      })
        .setIssuedAt()
        .setExpirationTime("1h")
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret);

      await sendMail(
        "Email Verification Request by Developer Spandan",
        email,
        emailVerificationLink(
          `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`
        )
      );

      return response(
        false,
        401,
        "Email is not verified. New verification link is sent to your registered email address"
      );
    }
    const isPasswordVerified = await getUser.comparePassword(password);

    if (!isPasswordVerified) {
      return response(false, 400, "Invalid login credentails.");
    }

    //otp
    await OTPModel.deleteMany({ email });

    const otp = generateOTP();

    //storing otp into database
    const newOtpData = new OTPModel({
      email,
      otp,
    });

    await newOtpData.save();

    const otpEmailStatus = await sendMail(
      "Your login verification code",
      email,
      otpEmail(otp)
    );

    if (!otpEmailStatus.success) {
      return response(false, 400, "Failed to send OTP");
    }

    return response(true, 200, "Please Verify your device");
  } catch (error) {
    return catchError(error);
  }
}
