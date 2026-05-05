"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;

  const [profile, setProfile] = useState<{ username: string; bio: string; displayName: string } | null>(null);
  const [links, setLinks] = useState<{ id: string; title: string; url: string; faviconUrl: string; clickCount: number }[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", nickname));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        setUid(userDoc.id);
        setProfile(userDoc.data() as any);

        const linksRef = collection(db, "users", userDoc.id, "links");
        const linksQuery = query(linksRef, orderBy("createdAt", "asc"));
        const linksSnapshot = await getDocs(linksQuery);
        
        const fetchedLinks = linksSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as any[];
        
        setLinks(fetchedLinks);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nickname]);

  const handleShare = async () => {
    if (!profile) return;
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

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, linkId: string, url: string) => {
    e.preventDefault(); // 기본 이동 방지 후 새 탭으로 열기
    window.open(url, '_blank', 'noopener,noreferrer');
    
    if (uid) {
      try {
        const linkRef = doc(db, "users", uid, "links", linkId);
        await updateDoc(linkRef, {
          clickCount: increment(1)
        });
      } catch (error) {
        console.error("클릭 수 업데이트 실패:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">존재하지 않는 페이지입니다.</h1>
        <p className="text-slate-500 mb-6">주소를 다시 한 번 확인해 주세요.</p>
        <Button onClick={() => window.location.href = "/"}>홈으로 돌아가기</Button>
      </div>
    );
  }

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
          {links.map(link => (
            <a 
              key={link.id} 
              href={link.url}
              onClick={(e) => handleLinkClick(e, link.id, link.url)}
              className="flex items-center justify-center relative w-full h-[58px] p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-[0.98]"
            >
              <div className="absolute left-4">
                {link.faviconUrl ? (
                  <img 
                    src={link.faviconUrl} 
                    alt="" 
                    className="w-6 h-6 rounded-sm bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
                    <LinkIcon size={14} />
                  </div>
                )}
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
