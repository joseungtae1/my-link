"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon, Plus, Pencil, Trash } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment, onSnapshot, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { InlineEdit } from "@/components/inline-edit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;

  const { user } = useAuth();
  const [profile, setProfile] = useState<{ username: string; bio: string; displayName: string } | null>(null);
  const [links, setLinks] = useState<{ id: string; title: string; url: string; faviconUrl: string; clickCount: number }[]>([]);
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [error, setError] = useState("");

  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editError, setEditError] = useState("");

  const isOwner = user && ownerUid && user.uid === ownerUid;

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeLinks: (() => void) | undefined;

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
        const uid = userDoc.id;
        setOwnerUid(uid);

        // 프로필 실시간 리스너
        unsubscribeProfile = onSnapshot(doc(db, "users", uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as any);
          }
        });

        // 링크 목록 실시간 리스너
        const linksRef = collection(db, "users", uid, "links");
        const linksQuery = query(linksRef, orderBy("createdAt", "desc"));
        unsubscribeLinks = onSnapshot(linksQuery, (snapshot) => {
          const fetchedLinks = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
          })) as any[];
          setLinks(fetchedLinks);
        });

      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeLinks) unsubscribeLinks();
    };
  }, [nickname]);

  const handleUpdateProfile = async (field: "username" | "bio", value: string) => {
    if (!isOwner || !ownerUid) return;
    const userRef = doc(db, "users", ownerUid);
    await updateDoc(userRef, { [field]: value });
  };

  const handleDialogSubmit = async () => {
    if (!isOwner || !ownerUid) return;
    
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
      if (!domainRegex.test(urlObj.hostname)) throw new Error("Invalid domain");
      finalUrl = targetUrl;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      setError("존재하지 않는 링크입니다.");
      return;
    }

    const linksRef = collection(db, "users", ownerUid, "links");
    await addDoc(linksRef, {
      title: newLinkTitle,
      url: finalUrl,
      faviconUrl,
      clickCount: 0,
      createdAt: serverTimestamp()
    });

    setNewLinkTitle("");
    setNewLinkUrl("");
    setIsAddLinkDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!isOwner || !ownerUid || !editingLinkId) return;
    
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
      if (!domainRegex.test(urlObj.hostname)) throw new Error("Invalid domain");
      finalUrl = targetUrl;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
      setEditError("존재하지 않는 링크 입니다.");
      return;
    }

    const linkRef = doc(db, "users", ownerUid, "links", editingLinkId);
    await updateDoc(linkRef, {
      title: editLinkTitle,
      url: finalUrl,
      faviconUrl
    });

    setIsEditLinkDialogOpen(false);
    setEditingLinkId(null);
  };

  const handleDeleteLink = async (id: string) => {
    if (!isOwner || !ownerUid) return;
    const linkRef = doc(db, "users", ownerUid, "links", id);
    await deleteDoc(linkRef);
  };

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
    
    if (ownerUid) {
      try {
        const linkRef = doc(db, "users", ownerUid, "links", linkId);
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
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        
        {/* 프로필 섹션 */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="space-y-2">
            {isOwner ? (
              <InlineEdit
                value={profile.username}
                onSave={(val) => handleUpdateProfile("username", val)}
                className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight border-b border-transparent hover:border-slate-200 focus:border-slate-400"
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                {profile.username}
              </h1>
            )}
          </div>
          
          <div className="max-w-2xl">
            {isOwner ? (
              <InlineEdit
                value={profile.bio}
                onSave={(val) => handleUpdateProfile("bio", val)}
                isTextarea
                placeholder="나를 소개하는 한 줄을 적어주세요."
                className="text-lg md:text-xl text-slate-600 leading-relaxed whitespace-pre-wrap"
              />
            ) : (
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="pt-4">
              <Dialog open={isAddLinkDialogOpen} onOpenChange={(open) => {
                setIsAddLinkDialogOpen(open);
                if (!open) setError("");
              }}>
                <DialogTrigger
                  render={
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 shadow-md gap-2"
                    />
                  }
                >
                  <Plus size={18} /> 새 링크 추가하기
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>새 링크 추가</DialogTitle>
                    <DialogDescription>추가할 링크의 제목과 URL을 입력해주세요.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">제목</Label>
                      <Input id="title" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} placeholder="예: 내 블로그" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="url" className="text-right">URL</Label>
                      <Input id="url" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="https://example.com" className="col-span-3" />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500 font-medium mb-4 text-center">{error}</p>}
                  <DialogFooter>
                    <Button type="button" onClick={handleDialogSubmit} className="bg-blue-600 hover:bg-blue-700 text-white w-full">추가하기</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* 링크 목록 섹션 - 웹 최적화 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {links.map(link => (
            <div key={link.id} className="group relative">
              <a 
                href={link.url}
                onClick={(e) => handleLinkClick(e, link.id, link.url)}
                className="flex items-center h-20 p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 group-active:scale-[0.98]"
              >
                <div className="flex-shrink-0 mr-4">
                  {link.faviconUrl ? (
                    <img src={link.faviconUrl} alt="" className="w-10 h-10 rounded-lg bg-slate-50" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <LinkIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </span>
                  {isOwner && (
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      CLICKS: {link.clickCount}
                    </span>
                  )}
                </div>
              </a>

              {isOwner && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingLinkId(link.id);
                      setEditLinkTitle(link.title);
                      setEditLinkUrl(link.url);
                      setIsEditLinkDialogOpen(true);
                    }}
                    className="p-2 bg-white/80 backdrop-blur shadow-sm text-slate-400 hover:text-blue-500 rounded-full border border-slate-100"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 bg-white/80 backdrop-blur shadow-sm text-slate-400 hover:text-red-500 rounded-full border border-slate-100"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 수정 다이얼로그 */}
        <Dialog open={isEditLinkDialogOpen} onOpenChange={(open) => {
          setIsEditLinkDialogOpen(open);
          if (!open) { setEditError(""); setEditingLinkId(null); }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>링크 수정</DialogTitle>
              <DialogDescription>링크의 제목과 URL을 수정할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">제목</Label>
                <Input id="edit-title" value={editLinkTitle} onChange={(e) => setEditLinkTitle(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-url" className="text-right">URL</Label>
                <Input id="edit-url" value={editLinkUrl} onChange={(e) => setEditLinkUrl(e.target.value)} className="col-span-3" />
              </div>
            </div>
            {editError && <p className="text-sm text-red-500 font-medium mb-4 text-center">{editError}</p>}
            <DialogFooter>
              <Button type="button" onClick={handleEditSubmit} className="bg-blue-600 hover:bg-blue-700 text-white w-full">저장하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 액션 버튼 (공유) */}
        {!isOwner && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Button 
              onClick={handleShare}
              className="rounded-full shadow-2xl bg-slate-900 hover:bg-slate-800 text-white px-8 h-14 gap-2 text-lg"
            >
              <Share2 size={20} />
              프로필 공유하기
            </Button>
          </div>
        )}

        {/* 푸터 */}
        <div className="pt-10 border-t border-slate-200 text-center">
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
            Powered by MyLink
          </span>
        </div>
      </div>
    </main>
  );
}
