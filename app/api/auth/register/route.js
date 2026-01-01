import { emailVerificationLink } from "@/email/emailVerification";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";

export async function POST(request) {
  try {
    await connectDB();
    //Validation Schema
    const validationSchema = zSchema.pick({
      name: true,
      password: true,
      email: true,
    });

    const payload = await request.json();
    const validatedData = validationSchema.safeParse(payload);

    if (!validatedData.success) {
      return response(
        false,
        401,
        "Invalid or missing input fields",
        validatedData.error
      );
    }

    const { name, email, password } = validatedData.data;
    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return response(false, 409, "User already registered.");
    }
    //new Registration
    const NewRegistration = new UserModel({
      name,
      email,
      password,
    });

    await NewRegistration.save();

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const token = await new SignJWT({ userID: NewRegistration._id.toString() })
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
      true,
      200,
      "Registration successfull, please verify your email address."
    );
  } catch (error) {
    return catchError(error);
  }
}
