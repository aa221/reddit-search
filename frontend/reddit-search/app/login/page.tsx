// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // For optimized images
import { Button} from "@/components/ui/button"; // Adjust based on your project structure
import { Alert} from "@/components/ui/alert"; // Adjust based on your project structure

export const dynamic = "force-dynamic"; // Prevents static generation

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Ensure the code runs only on the client side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const code = params.get("code");

      if (userId) {
        // Save userId to localStorage or your state management solution
        localStorage.setItem("userId", userId);
        // Redirect to the main application
        router.push("/dashboard"); // Update this to your main app page
      } else if (code) {
        // Handle the OAuth code if necessary
        console.log("OAuth code received:", code);
        // Optionally, you can exchange the code for a session or perform other actions
      }
    }
  }, []); // Empty dependency array ensures this runs once after mount

  const handleGoogleLogin = () => {
    try {
      window.location.href = "https://reddit-search-production.up.railway.app/signin/google";
    } catch (error) {
      setErrorMessage("Failed to login with Google. Please try again.");
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[350px] p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Reddit Search</h1>
        <p className="text-center mb-6">Find the information you need from subreddits, faster</p>
        {errorMessage && <Alert variant="destructive">{errorMessage}</Alert>}
        <Button className="w-full" onClick={handleGoogleLogin}>
          Login with Google
        </Button>
        {/* Example of replacing an <img> tag with <Image> */}

      </div>
    </div>
  );
}
