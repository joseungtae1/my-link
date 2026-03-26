"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            MyLink
          </h1>
          <p className="text-slate-500">
            복잡한 설정 없이 완성하는 나의 링크
          </p>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={handleLogin}
            className="w-full text-base py-6 font-medium"
            size="lg"
          >
            Google 계정으로 시작하기
          </Button>
        </div>
      </div>
    </main>
  );
}
