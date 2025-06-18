import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "./ui/Logo";
import Confetti from "react-confetti";
import { useTheme } from "../hooks/useTheme";

export const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get("session_id");
  const [confettiDimensions, setConfettiDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { theme } = useTheme();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["stripe-subscription"] });
    queryClient.invalidateQueries({ queryKey: ["stripe-orders"] });
  }, [queryClient]);

  useEffect(() => {
    const handleResize = () =>
      setConfettiDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${
        theme === "dark" ? "dark" : ""
      } min-h-screen flex flex-col items-center justify-center py-12 px-6 relative bg-white dark:bg-[#0f1117] transition-colors duration-500`}
    >
      <Confetti
        width={confettiDimensions.width}
        height={confettiDimensions.height}
        numberOfPieces={180}
        recycle={false}
        gravity={0.35}
        colors={["#ff5233", "#ffd54f", "#4caf50", "#29b6f6", "#ab47bc"]}
      />

      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="relative">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#ff5233] mb-6 shadow-xl ring-4 ring-orange-200 dark:ring-orange-900">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          You’re in! 🎉
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Welcome to{" "}
          <span className="font-semibold text-[#ff5233]">ChatterWise</span> —
          it’s time to build something amazing.
        </p>

        {sessionId && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-8 border border-gray-300 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Session ID
            </p>
            <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex justify-center items-center w-full px-6 py-3 rounded-lg text-base font-bold text-white bg-[#ff5233] hover:bg-[#e04427] shadow-lg transition"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            to="/chatbots"
            className="inline-flex justify-center items-center w-full px-6 py-3 rounded-lg text-base font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Create Your First Chatbot
          </Link>
        </div>

        <div className="mt-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            What’s Next
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            {[
              "Create and customize your chatbots",
              "Upload your Bot Knowledge content",
              "Integrate with your website or app",
              "Monitor analytics and performance",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#ff5233]">✔</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
