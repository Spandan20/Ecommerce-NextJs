import { zSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ButtonLoading from "./ButtonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { showToast } from "@/lib/showToast";
import axios from "axios";

const OTPVerification = ({ email, onSubmit, loading }) => {
  const [isResendOtp, setIsResendingOtp] = useState(false);

  const formSchema = zSchema.pick({
    otp: true,
    email: true,
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
      email: email,
    },
  });

  const handleOtpVerification = async (values) => {
    onSubmit(values);
  };

  const resendOTP = async () => {
    try {
      setIsResendingOtp(true);
      const { data: registerResponse } = await axios.post(
        "/api/auth/resend-otp",
        { email }
      );
      if (!registerResponse.success) {
        throw new Error(registerResponse.message);
      }
      showToast("success", registerResponse.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div>
      <div className="mt-5 text-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleOtpVerification)}>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                Please complete verification
              </h1>
              <p className="text-md">
                We have sent an One Time Password (OTP) to your registered email
                address. The OTP is valid for 10 mins only
              </p>
            </div>
            <div className="mt-5 flex justify-center">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-col items-center">
                      One-Time Password
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot className="text-xl size-10" index={0} />
                          <InputOTPSlot className="text-xl size-10" index={1} />
                          <InputOTPSlot className="text-xl size-10" index={2} />
                          <InputOTPSlot className="text-xl size-10" index={3} />
                          <InputOTPSlot className="text-xl size-10" index={4} />
                          <InputOTPSlot className="text-xl size-10" index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-5">
              <ButtonLoading
                className="w-full cursor-pointer"
                type="submit"
                text="Verify"
                loading={loading}
              />
              <div className="mt-3 text-center">
                {!isResendOtp ? (
                  <button
                    onClick={resendOTP}
                    type="button"
                    className="text-blue-500 cursor-pointer hover:underline"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-md">Resending...</span>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OTPVerification;
