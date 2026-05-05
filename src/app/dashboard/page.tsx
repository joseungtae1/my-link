"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { logOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "@/components/inline-edit";
import { Plus, Trash, LogOut, ArrowRight, Link as LinkIcon, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dummyLinks } from "@/data/links";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<{ displayName: string; username: string; bio: string } | null>(null);
  const [links, setLinks] = useState<{ id: string; title: string; url: string; faviconUrl: string; clickCount: number }[]>([]);

  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [error, setError] = useState("");

  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editError, setEditError] = useState("");

  // 로그인되지 않은 사용자는 홈으로 리다이렉트
  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);
  
  // 파이어베이스 실시간 데이터 패칭
  useEffect(() => {
    if (!user) return;

    // 프로필 데이터 리스너
    const userRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as any);
      } else {
        // 새 유저일 경우 기본값 설정
        const emailPrefix = user.email ? user.email.split('@')[0] : `user_${Date.now()}`;
        setProfile({
          displayName: emailPrefix,
          username: user.displayName || "새 사용자",
          bio: "여기를 클릭해 한 줄 소개를 수정해 보세요."
        });
      }
    });

    // 링크 목록 리스너
    const linksRef = collection(db, "users", "anonymous", "links");
    const q = query(linksRef, orderBy("createdAt", "desc"));
    const unsubscribeLinks = onSnapshot(q, (querySnapshot) => {
      const fetchedLinks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setLinks(fetchedLinks);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeLinks();
    };
  }, [user]);

  const handleUpdateProfile = async (field: "username" | "bio", value: string) => {
    if (!user || !profile) return;
    
    // 로컬 상태 즉시 업데이트 (Optimistic UI)
    setProfile(prev => prev ? { ...prev, [field]: value } : null);

    // 파이어베이스 업데이트 (없으면 생성 병합)
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { [field]: value }, { merge: true });
  };


  const handleDialogSubmit = async () => {
    if (!user) return;
    
    if (newLinkTitle.trim() === "" || newLinkUrl.trim() === "") {
      setError("최소 한글자 이상은 입력해야 합니다.");
      return;
    }

    setError("");
    let faviconUrl = "";
    let finalUrl = newLinkUrl.trim();

    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    
    try {
      const targetUrl = finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`;
      const urlObj = new URL(targetUrl);
      
      if (!domainRegex.test(urlObj.hostname)) {
        throw new Error("Invalid domain");
      }
      
      finalUrl = targetUrl;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      setError("존재하지 않는 링크입니다.");
      return;
    }

    // 파이어베이스에 추가
    const linksRef = collection(db, "users", "anonymous", "links");
    await addDoc(linksRef, {
      title: newLinkTitle,
      url: finalUrl,
      faviconUrl: faviconUrl,
      clickCount: 0,
      createdAt: serverTimestamp()
    });

    // 만약 프로필이 DB에 없는 상태라면 이 시점에 생성해줍니다.
    if (profile) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profile, { merge: true });
    }

    setNewLinkTitle("");
    setNewLinkUrl("");
    setError("");
    setIsAddLinkDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!editingLinkId) return;
    
    if (editLinkTitle.trim() === "" || editLinkUrl.trim() === "") {
      setEditError("최소 한 글자 이상은 입력해야 합니다.");
      return;
    }

    setEditError("");
    let faviconUrl = "";
    let finalUrl = editLinkUrl.trim();

    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    
    try {
      const targetUrl = finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`;
      const urlObj = new URL(targetUrl);
      
      if (!domainRegex.test(urlObj.hostname)) {
        throw new Error("Invalid domain");
      }
      
      finalUrl = targetUrl;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      setEditError("존재하지 않는 링크 입니다.");
      return;
    }

    const linkRef = doc(db, "users", "anonymous", "links", editingLinkId);
    await updateDoc(linkRef, {
      title: editLinkTitle,
      url: finalUrl,
      faviconUrl: faviconUrl
    });

    setIsEditLinkDialogOpen(false);
    setEditingLinkId(null);
    setEditLinkTitle("");
    setEditLinkUrl("");
    setEditError("");
  };

  const handleUpdateLink = async (id: string, field: "title" | "url" | "clickCount", value: string) => {
    if (!user) return;
    
    // 로컬 상태 즉시 업데이트
    setLinks(prev => prev.map(link => {
      if (link.id !== id) return link;
      if (field === "clickCount") return { ...link, clickCount: parseInt(value) };
      return { ...link, [field]: value };
    }));

    const linkRef = doc(db, "users", "anonymous", "links", id);
    let updateData: any = { [field]: field === "clickCount" ? parseInt(value) : value };

    // URL 업데이트 시 파비콘 갱신
    if (field === "url" && value.trim() !== "") {
      try {
        const targetUrl = value.startsWith('http') ? value : `https://${value}`;
        const urlObj = new URL(targetUrl);
        updateData.url = targetUrl;
        updateData.faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      } catch (e) {
        // 무시
      }
    }

    // 새 링크(id에 local- 포함)가 아직 DB에 완전히 써지기 전에 클릭되면 에러날 수 있지만, 
    // real-time listener가 id를 덮어씌워 주므로 일반적으로 문제 없습니다.
    if (!id.startsWith("local-")) {
      await updateDoc(linkRef, updateData);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!user) return;
    setLinks(prev => prev.filter(link => link.id !== id));
    if (!id.startsWith("local-")) {
      const linkRef = doc(db, "users", "anonymous", "links", id);
      await deleteDoc(linkRef);
    }
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

          <div className="pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">프로필 편집</h2>
            <p className="text-slate-500 mt-1">인라인 텍스트를 클릭하여 바로 수정하세요.</p>
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">내 링크 목록</h3>
              <Dialog open={isAddLinkDialogOpen} onOpenChange={(open) => {
                setIsAddLinkDialogOpen(open);
                if (!open) setError("");
              }}>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                      size="sm"
                    />
                  }
                >
                  <Plus size={16} /> 새 링크 추가
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>새 링크 추가</DialogTitle>
                    <DialogDescription>
                      추가할 링크의 제목과 URL을 입력해주세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        제목
                      </Label>
                      <Input
                        id="title"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="예: 내 블로그"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 font-medium mb-4 text-center">
                      {error}
                    </p>
                  )}
                  <DialogFooter>
                    <Button type="button" onClick={handleDialogSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">추가하기</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

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
                  <p className="font-bold text-slate-900 w-full block truncate">{link.title}</p>
                  <p className="text-sm text-slate-500 font-mono w-full block truncate">{link.url}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Clicks</p>
                    <p className="text-lg font-mono font-bold text-slate-900">{link.clickCount}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingLinkId(link.id);
                        setEditLinkTitle(link.title);
                        setEditLinkUrl(link.url);
                        setIsEditLinkDialogOpen(true);
                      }} 
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                      title="수정"
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md" title="삭제">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}


          </div>

          {/* Edit Link Dialog */}
          <Dialog open={isEditLinkDialogOpen} onOpenChange={(open) => {
            setIsEditLinkDialogOpen(open);
            if (!open) {
              setEditError("");
              setEditingLinkId(null);
            }
          }}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>링크 수정</DialogTitle>
                <DialogDescription>
                  링크의 제목과 URL을 수정할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    제목
                  </Label>
                  <Input
                    id="edit-title"
                    value={editLinkTitle}
                    onChange={(e) => setEditLinkTitle(e.target.value)}
                    placeholder="예: 내 블로그"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="edit-url"
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              {editError && (
                <p className="text-sm text-red-500 font-medium mb-4 text-center">
                  {editError}
                </p>
              )}
              <DialogFooter>
                <Button type="button" onClick={handleEditSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">저장하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  onClick={(e) => {
                    // Prevent default only if we want to simulate click count without opening link, 
                    // but usually we want both. Here we simulate the click increment.
                    handleUpdateLink(link.id, "clickCount" as any, (link.clickCount + 1).toString());
                  }}
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
