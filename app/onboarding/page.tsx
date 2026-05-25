"use client";

import { useRouter } from "next/navigation";
import { IntegratedOnboarding } from "@/components/IntegratedOnboarding";

export default function OnboardingPage() {
  const router = useRouter();

  const handleOnboardingComplete = (finalData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("has_completed_onboarding", "true");
    }
    router.push("/auth");
  };



  return (
    <div className="w-full min-h-screen bg-zinc-950 relative">


      <IntegratedOnboarding onComplete={handleOnboardingComplete} />
    </div>
  );
}

