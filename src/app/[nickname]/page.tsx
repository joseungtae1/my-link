"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2, Link as LinkIcon, Plus, Pencil, Trash, LogOut, Eye, Copy } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment, onSnapshot, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { logOut } from "@/lib/auth";
import { InlineEdit } from "@/components/inline-edit";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const unwrappedParams = use(params);
  const nickname = unwrappedParams.nickname;
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ username: string; bio: string; displayName: string } | null>(null);
  const [links, setLinks] = useState<{ id: string; title: string; url: string; faviconUrl: string; clickCount: number }[]>([]);
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [error, setError] = useState("");

  const [isEditLinkDialogOpen, setIsEditLinkDialogOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editError, setEditError] = useState("");

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const isOwner = user && ownerUid && user.uid === ownerUid;

  const handleLogout = async () => {
    setRedirecting(true);
    await logOut();
    router.push("/");
  };

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
          setDataLoading(false);
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
        setDataLoading(false);
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

  const handleAddDefaultLinks = async () => {
    if (!isOwner || !ownerUid) return;
    
    const dummyLinks = [
      { title: "인스타그램", url: "https://instagram.com" },
      { title: "유튜브", url: "https://youtube.com" },
      { title: "블로그", url: "https://velog.io" },
      { title: "GitHub", url: "https://github.com" },
      { title: "포트폴리오", url: "https://notion.so" },
    ];

    const linksRef = collection(db, "users", ownerUid, "links");
    
    for (const link of dummyLinks) {
      const urlObj = new URL(link.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
      
      await addDoc(linksRef, {
        title: link.title,
        url: link.url,
        faviconUrl,
        clickCount: 0,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
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
      handleCopyLink();
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

  if (authLoading || dataLoading || redirecting) {
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
    <main className="min-h-screen bg-white font-sans selection:bg-slate-900 selection:text-white pb-20">
      {/* 토스트 알림 */}
      {showCopyToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2">
            <LinkIcon size={14} className="text-blue-400" />
            링크를 복사했어요.
          </div>
        </div>
      )}

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="text-xl font-black text-blue-600 cursor-pointer tracking-tighter"
            onClick={() => window.location.href = "/"}
          >
            MyLink
          </div>
          
          {user && (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden hover:border-blue-200 transition-all shadow-sm"
              >
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="My Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
              
              {isProfileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* 사용자 정보 섹션 */}
                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30">
                      <p className="font-bold text-slate-900 truncate">
                        {user.displayName || "사용자"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* 메뉴 아이템 */}
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          window.open(`/${nickname}`, "_blank");
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={16} className="text-slate-400" />
                        내 페이지 미리보기
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleCopyLink();
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Copy size={16} className="text-slate-400" />
                        링크 복사
                      </button>
                    </div>

                    {/* 하단 로그아웃 */}
                    <div className="border-t border-slate-50 py-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut size={16} />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* 프로필 섹션 */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          {/* 프로필 이미지 */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-50 relative">
              <img 
                src={isOwner ? (user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-col items-center">
              {isOwner ? (
                <InlineEdit
                  value={profile.username}
                  onSave={(val) => handleUpdateProfile("username", val)}
                  className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                  {profile.username}
                </h1>
              )}
              <span className="text-sm md:text-base font-medium text-slate-400 mt-1">
                @{nickname}
              </span>
            </div>
          </div>
          
          <div className="max-w-2xl">
            {isOwner ? (
              <InlineEdit
                value={profile.bio}
                onSave={(val) => handleUpdateProfile("bio", val)}
                isTextarea
                placeholder="나를 소개하는 한 줄을 적어주세요."
                className="text-base md:text-lg text-slate-500 leading-relaxed whitespace-pre-wrap"
              />
            ) : (
              <p className="text-base md:text-lg text-slate-500 leading-relaxed whitespace-pre-wrap">
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
        {links.length > 0 ? (
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
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 mb-24">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <LinkIcon size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">아직 등록된 링크가 없습니다.</h3>
            <p className="text-slate-500 mb-8">새로운 링크를 추가하여 프로필을 완성해보세요.</p>
            {isOwner && (
              <Button 
                variant="outline" 
                onClick={handleAddDefaultLinks}
                className="rounded-full px-8 h-12 border-slate-200 hover:bg-slate-50 hover:text-slate-900 gap-2"
              >
                기본 링크 5개 추가하기
              </Button>
            )}
          </div>
        )}
        
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
