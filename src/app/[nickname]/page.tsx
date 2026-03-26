"use client";

import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;

  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRef = collection(db, "users");
        // displayName 필드를 nickname url slug로 쿼리합니다.
        const q = query(usersRef, where("displayName", "==", nickname));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // 일치하는 사용자 문서 획득 (displayName은 고유해야 함)
        const userDoc = querySnapshot.docs[0];
        setProfile(userDoc.data());

        // 하위 링크 목록(links) 시간순으로 정렬하여 Fetch
        const linksRef = collection(db, "users", userDoc.id, "links");
        const linksQuery = query(linksRef, orderBy("createdAt", "asc"));
        const linksSnapshot = await getDocs(linksQuery);

        const linksData = linksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLinks(linksData);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    if (nickname) fetchData();
  }, [nickname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-800">페이지를 찾을 수 없습니다.</h1>
        <p className="text-slate-500">요청하신 주소(@{nickname})의 링크 프로필이 존재하지 않습니다.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4">
       <div className="w-full max-w-md">
          <div className="text-center space-y-4 mb-10 px-2">
             <h1 className="text-2xl font-bold text-slate-900 whitespace-pre-wrap">{profile.username}</h1>
             <p className="text-base text-slate-600 whitespace-pre-wrap">{profile.bio}</p>
          </div>

          <div className="space-y-4 w-full">
            {links.map(link => (
              <a 
               key={link.id} 
               href={link.url || '#'}
               target="_blank"
               className="block w-full p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:-translate-y-0.5 transition-all font-medium text-slate-800 text-base flex items-center justify-center relative shadow-sm h-[60px]"
              >
                {link.faviconUrl && (
                  <img src={link.faviconUrl} alt="" className="w-6 h-6 absolute left-5 bg-transparent rounded-sm" />
                )}
                <span className="truncate px-10">{link.title || "새로운 링크"}</span>
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
