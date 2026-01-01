"use client";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import verifiedImg from "@/public/assets/images/verified.gif";
import verificationFailedImg from "@/public/assets/images/verification-failed.gif";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";
import { Spinner } from "@/components/ui/spinner";

const EmailVerification = () => {
  const { token } = useParams();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      const { data: verificationResponse } = await axios.post(
        "/api/auth/verify-email",
        { token }
      );
      if (verificationResponse.success) {
        setIsVerified(true);
      }
      setIsLoading(false);
    };
    verify();
  }, [token]);
  console.log(token);
  return isLoading ? (
    <Spinner className="size-10" />
  ) : (
    <Card className="w-lg">
      <CardContent>
        <div>
          <div className="flex justify-center items-center">
            <Image
              src={isVerified ? verifiedImg : verificationFailedImg}
              height={350}
              unoptimized={true}
              loading="eager"
              alt={
                isVerified
                  ? "Verification Successful"
                  : "Verification Unsuccessful"
              }
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold my-5">
              {isVerified
                ? "Email Verification Successful"
                : "Email Verification Unsuccessful"}
            </h1>
            <Button asChild>
              <Link href={WEBSITE_HOME}>Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
