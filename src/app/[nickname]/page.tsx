"use client";

import { use, useEffect, useState } from "react";
import { dummyLinks } from "@/data/links";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon } from "lucide-react";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;

  const [profile, setProfile] = useState({
    username: nickname,
    bio: "간단한 한 줄 소개입니다. 나만의 링크를 공유해보세요.",
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username}의 마이링크`,
          text: profile.bio,
          url: window.location.href,
        });
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      // Fallback: URL 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("링크가 클립보드에 복사되었습니다!");
      } catch (err) {
        alert("링크 복사에 실패했습니다.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center">
        
        {/* 프로필 섹션 (이미지 없이 텍스트 중심) */}
        <div className="text-center space-y-4 mb-12 w-full">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {profile.username}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-xs mx-auto whitespace-pre-wrap">
            {profile.bio}
          </p>
        </div>

        {/* 링크 목록 섹션 (대시보드 미리보기 스타일) */}
        <div className="w-full space-y-4 mb-16">
          {dummyLinks.map(link => (
            <a 
              key={link.id} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center relative w-full h-[58px] p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-[0.98]"
            >
              <div className="absolute left-4">
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`} 
                  alt="" 
                  className="w-6 h-6 rounded-sm bg-slate-50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors truncate px-8">
                {link.title}
              </span>
            </a>
          ))}
        </div>
        
        {/* 액션 버튼 */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Button 
            onClick={handleShare}
            className="rounded-full shadow-lg bg-slate-900 hover:bg-slate-800 text-white px-6 h-12 gap-2"
          >
            <Share2 size={18} />
            프로필 공유하기
          </Button>
        </div>

        {/* 푸터 */}
        <div className="mt-auto pt-10 text-center">
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
            Powered by MyLink
          </span>
        </div>
      </div>
    </main>
  );
}
