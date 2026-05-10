"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!loading && user) {
        setRedirecting(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          router.push(`/${data.displayName}`);
        } else {
          // 신규 유저인 경우 기본 닉네임(이메일 앞자리)으로 리다이렉트
          const emailPrefix = user.email ? user.email.split("@")[0] : `user_${Date.now()}`;
          router.push(`/${emailPrefix}`);
        }
      }
    };
    checkUserAndRedirect();
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      setRedirecting(true);
      const user = await signInWithGoogle();
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          router.push(`/${data.displayName}`);
        } else {
          const emailPrefix = user.email ? user.email.split("@")[0] : `user_${Date.now()}`;
          router.push(`/${emailPrefix}`);
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      setRedirecting(false);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  if (loading || redirecting) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full h-16 flex items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-md z-50">
        <div className="text-xl font-black text-blue-600 tracking-tighter">MyLink</div>
        <Button 
          variant="ghost" 
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 h-9 font-bold text-xs"
        >
          로그인
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-32 md:pt-48 px-6 overflow-hidden">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Development in <span className="text-blue-600">One Link.</span>
          </h1>
          
          <div className="space-y-2">
            <p className="text-lg md:text-xl font-medium text-slate-500">
              GitHub, 블로그, 포트폴리오까지.
            </p>
            <p className="text-lg md:text-xl font-medium text-slate-500">
              개발자를 위한 모든 링크를 한 페이지에 담아보세요.
            </p>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleLogin}
              className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 h-16 rounded-lg text-lg font-bold shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 mx-auto"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 시작하기
            </button>
          </div>
        </div>

        {/* CSS Mockup Preview */}
        <div className="mt-20 w-full max-w-2xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="bg-white rounded-t-3xl border-x border-t border-slate-100 shadow-2xl p-8 pb-0 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-slate-50 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-16 w-full bg-blue-50/50 rounded-2xl border border-blue-100"></div>
              <div className="h-16 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
              <div className="h-16 w-full bg-slate-50 rounded-2xl border border-slate-100 opacity-50"></div>
            </div>
          </div>
          {/* Reflection Effect */}
          <div className="absolute -bottom-10 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent z-10"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-[10px] font-bold text-slate-300 tracking-[0.3em] uppercase">
          © 2026 MyLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
