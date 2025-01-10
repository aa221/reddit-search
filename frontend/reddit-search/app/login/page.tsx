"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleLogin = async () => {
    try {
      // Example: Redirect to Google OAuth
      window.location.href = "https://reddit-search.up.railway.app/signin/google";

      // In a real-world scenario, you might receive the userId from your backend
      // after the OAuth flow completes and set it like:
      //
      // const userIdFromServer = "1234"; // Example from server
      // setUserId(userIdFromServer);
      //
      // Then redirect or handle next steps.
    } catch (error) {
      setErrorMessage("Failed to login with Google. Please try again.");
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reddit Search
          </CardTitle>
          <CardDescription className="text-center">
            Find the information you need from subreddits, faster
          </CardDescription>
          <CardDescription className="text-center">
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              {errorMessage}
            </Alert>
          )}
          <div className="mt-4">
            <Button className="w-full" onClick={handleGoogleLogin}>
              Login with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter>{/* ... */}</CardFooter>
      </Card>
    </div>
  );
}
