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
    <main className="min-h-screen flex flex-col items-center py-20 px-4 bg-background font-sans">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* 프로필 섹션 */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10 px-2 mt-4">
          {/* 아바타 (미니멀) */}
          <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="text-3xl text-muted-foreground font-semibold">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* 이름과 소개 */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground whitespace-pre-wrap">
              {profile.username}
            </h1>
            <p className="text-sm text-muted-foreground font-medium whitespace-pre-wrap max-w-sm">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* 링크 목록 섹션 */}
        <div className="w-full flex flex-col gap-3">
          {dummyLinks.map(link => (
            <a 
              key={link.id} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            >
              <Card className="flex items-center h-14 relative cursor-pointer border border-border bg-card shadow-sm hover:bg-accent transition-colors overflow-hidden rounded-xl">
                <CardContent className="w-full p-0 flex items-center justify-center">
                  <span className="truncate px-6 font-semibold text-card-foreground text-[15px] group-hover:text-accent-foreground transition-colors">
                    {link.title}
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
        
        {/* 푸터 */}
        <div className="mt-16 text-center opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Powered by MyLink
          </span>
        </div>
      </div>
    </main>
  );
}
