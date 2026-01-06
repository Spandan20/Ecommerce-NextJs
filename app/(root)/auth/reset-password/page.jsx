"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/public/assets/images/logo-black.png";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/Applications/ButtonLoading";

import Link from "next/link";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Applications/OTPVerification";

const ResetPassword = () => {
  const [otpEmail, setOtpEmail] = useState();
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const formSchema = zSchema.pick({
    email: true,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleEmailVerification = async (values) => {};

  const handleOtpVerification = async (values) => {
    try {
      setOtpVerificationLoading(true);
      const { data: otpResponse } = await axios.post(
        "/api/auth/verify-otp",
        values
      );
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }
      setOtpEmail("");
      showToast("success", otpResponse.message);
      dispatch(login(otpResponse.data));
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  return (
    <Card className="w-[450px]">
      <CardContent>
        <div className="flex justify-center">
          <Image
            src={Logo.src}
            width={Logo.width}
            height={Logo.height}
            alt="Logo"
            className="max-w-[200px]"
          />
        </div>
        {!otpEmail ? (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold">Reset your password</h1>
              <p>Enter your email for password reset</p>
            </div>
            <div className="mt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEmailVerification)}>
                  <div className="mt-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <ButtonLoading
                      className="mt-5 w-full cursor-pointer"
                      type="submit"
                      text="Send OTP"
                      loading={emailVerificationLoading}
                    />
                  </div>
                  <div className="text-center">
                    <div className=" mt-5 flex justify-center gap-1">
                      <Link
                        href={WEBSITE_LOGIN}
                        className="text-secondary-foreground cursor-pointer underline"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <OTPVerification
            email={otpEmail}
            loading={otpVerificationLoading}
            onSubmit={handleOtpVerification}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
