"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { logOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "@/components/inline-edit";
import { Plus, Trash, LogOut, ArrowRight, Link as LinkIcon } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<{ displayName: string; username: string; bio: string } | null>(null);
  const [links, setLinks] = useState<{ id: string; title: string; url: string; faviconUrl: string }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          displayName: data.displayName || "",
          username: data.username || "사용자",
          bio: data.bio || "",
        });
      }
    });

    const linksRef = collection(db, "users", user.uid, "links");
    const q = query(linksRef, orderBy("createdAt", "asc"));
    const unsubscribeLinks = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setLinks(linksData);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeLinks();
    };
  }, [user]);

  const handleUpdateProfile = async (field: "username" | "bio", value: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { [field]: value });
  };

  const handleAddLink = async () => {
    if (!user) return;
    const linksRef = collection(db, "users", user.uid, "links");
    await addDoc(linksRef, {
      title: "새로운 링크",
      url: "",
      faviconUrl: "",
      createdAt: serverTimestamp()
    });
  };

  const handleUpdateLink = async (id: string, field: "title" | "url", value: string) => {
    if (!user) return;
    const linkRef = doc(db, "users", user.uid, "links", id);
    let updateData: any = { [field]: value };
    
    // Auto-fetch favicon on URL update
    if (field === "url" && value.trim() !== "") {
      try {
        const targetUrl = value.startsWith('http') ? value : `https://${value}`;
        const urlObj = new URL(targetUrl);
        updateData.url = targetUrl;
        updateData.faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      } catch (e) {
        // Invalid URL, ignore favicon
      }
    }
    
    await updateDoc(linkRef, updateData);
  };

  const handleDeleteLink = async (id: string) => {
    if (!user) return;
    if (!confirm("해당 링크를 삭제하시겠습니까?")) return;
    const linkRef = doc(db, "users", user.uid, "links", id);
    await deleteDoc(linkRef);
  };

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  if (loading || !profile) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-6 h-6 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
    </div>
  );

  const publicUrl = `http://localhost:3000/${profile.displayName}`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar/Navigation area */}
      <div className="w-16 border-r border-slate-200 bg-white flex flex-col items-center py-6 justify-between">
        <div className="font-bold text-xl text-slate-900 border border-slate-900 rounded-md w-10 h-10 flex items-center justify-center">M</div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-slate-900" title="로그아웃">
          <LogOut size={20} />
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">프로필 편집</h2>
              <p className="text-slate-500 mt-1">인라인 텍스트를 클릭하여 바로 수정하세요.</p>
            </div>
            <a href={`/${profile.displayName}`} target="_blank" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
              내 링크 방문하기 <ArrowRight size={14} />
            </a>
          </div>

          {/* Profile Editor */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">접속 주소 (수정 불가)</p>
              <div className="bg-slate-50 px-3 py-2 rounded-md text-sm text-slate-600 font-mono inline-block">
                {publicUrl}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">표시 이름</p>
              <InlineEdit 
                value={profile.username}
                onSave={(val) => handleUpdateProfile("username", val)}
                className="text-2xl font-bold border-b border-transparent hover:border-slate-200 focus:border-slate-400"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">자기 소개</p>
              <InlineEdit 
                value={profile.bio}
                onSave={(val) => handleUpdateProfile("bio", val)}
                isTextarea
                placeholder="나를 잘 표현할 수 있는 안녕하세요 인사말을 적어주세요."
                className="text-slate-600"
              />
            </div>
          </div>

          {/* Links Editor */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-900">내 링크 목록</h3>
            
            {links.map((link) => (
              <div key={link.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group flex gap-4 transition-all">
                <div className="flex-shrink-0 pt-1">
                  {link.faviconUrl ? (
                    <img src={link.faviconUrl} alt="icon" className="w-8 h-8 rounded-sm bg-slate-50" />
                  ) : (
                    <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center text-slate-400">
                      <LinkIcon size={16} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2 overflow-hidden">
                  <InlineEdit 
                    value={link.title}
                    onSave={(val) => handleUpdateLink(link.id, "title", val)}
                    placeholder="새로운 링크 타이틀"
                    className="font-bold text-slate-900 w-full block"
                  />
                  <InlineEdit 
                    value={link.url}
                    onSave={(val) => handleUpdateLink(link.id, "url", val)}
                    placeholder="https://를 포함한 주소 입력"
                    className="text-sm text-slate-500 font-mono w-full block"
                  />
                </div>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteLink(link.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}

            <Button 
              onClick={handleAddLink}
              variant="outline" 
              className="w-full py-6 mt-4 border-dashed border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-transparent"
            >
              <Plus size={18} className="mr-2" /> 새 링크 추가하기
            </Button>
            
          </div>

        </div>
      </div>

      {/* Preview Area (Right 40%) */}
      <div className="hidden lg:flex w-2/5 border-l border-slate-200 bg-slate-100 items-center justify-center p-10 relative">
        <div className="absolute top-6 right-6 text-xs text-slate-400 uppercase font-bold tracking-widest">
          미리보기
        </div>
        <div className="w-full max-w-[340px] h-[700px] bg-white rounded-[2.5rem] shadow-xl border-8 border-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-10"></div>
          
          <div className="h-full w-full overflow-y-auto px-6 py-16 scrollbar-hide flex flex-col items-center">
             <div className="text-center space-y-3 mb-10 w-full px-2">
                <h1 className="text-xl font-bold text-slate-900 whitespace-pre-wrap">{profile.username}</h1>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{profile.bio}</p>
             </div>

             <div className="space-y-4 w-full">
               {links.map(link => (
                 <a 
                  key={link.id} 
                  href={link.url || '#'}
                  target="_blank"
                  className="block w-full p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-slate-800 text-sm flex items-center justify-center relative shadow-sm h-[54px]"
                 >
                   {link.faviconUrl && (
                     <img src={link.faviconUrl} alt="" className="w-6 h-6 absolute left-4 bg-transparent rounded-sm" />
                   )}
                   <span className="truncate px-8">{link.title || "새로운 링크"}</span>
                 </a>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
