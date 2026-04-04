import { use } from "react";
import { dummyLinks } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;

  // 더미 프로필 데이터
  const profile = {
    username: nickname,
    bio: "간단한 한 줄 소개입니다.",
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4">
       <div className="w-full max-w-md">
          {/* 프로필 섹션 */}
          <div className="text-center space-y-4 mb-10 px-2">
             <h1 className="text-2xl font-bold text-slate-900 whitespace-pre-wrap">{profile.username}</h1>
             <p className="text-base text-slate-600 whitespace-pre-wrap">{profile.bio}</p>
          </div>

          {/* 링크 목록 섹션 */}
          <div className="space-y-4 w-full flex flex-col items-center">
            {dummyLinks.map(link => (
              <a 
               key={link.id} 
               href={link.url}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full block hover:-translate-y-1 transition-transform"
              >
                <Card className="h-[60px] flex items-center justify-center relative cursor-pointer border-slate-200">
                  <CardContent className="p-0 flex items-center justify-center w-full">
                     <span className="truncate px-10 font-medium text-slate-800 text-base">
                       {link.title}
                     </span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Powered by MyLink</span>
          </div>
       </div>
    </main>
  );
}
