import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const { userId, code } = router.query;

  useEffect(() => {
    if (userId) {
      // Save userId to localStorage or your state management solution
      localStorage.setItem("userId", userId as string);

      // Redirect to the main application
      router.push("/search"); // Update this to your main app page
    } else if (code) {
      // Handle the `code` parameter if needed (e.g., exchange for a session)
      console.log("OAuth code received:", code);
    }
  }, [userId, code]);

  const handleGoogleLogin = async () => {
    try {
      window.location.href = "https://reddit-search-production.up.railway.app/signin/google";
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[350px]">
        <h1 className="text-2xl font-bold text-center">Reddit Search</h1>
        <p className="text-center">Find the information you need from subreddits, faster</p>
        <button className="w-full mt-4 p-2 bg-blue-500 text-white" onClick={handleGoogleLogin}>
          Login with Google
        </button>
      </div>
    </div>
  );
}
