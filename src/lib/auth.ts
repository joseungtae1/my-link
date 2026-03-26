import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Firestore에 유저 정보가 있는지 확인
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // 최초 가입 시 DB 문서 생성
      const email = user.email || "";
      const emailPrefix = email.split("@")[0] || "user";
      
      // displayName (URL Slug) 고유성 검증 로직
      let baseSlug = emailPrefix;
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const q = query(collection(db, "users"), where("displayName", "==", slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          break; // 중복 없는 고유 슬러그
        }
        slug = `${baseSlug}${counter}`;
        counter++;
      }

      // 화면에 노출될 실제 이름 (username)
      const realName = user.displayName || "사용자";

      await setDoc(userRef, {
        displayName: slug,       // URL slug 용도 (이메일 앞부분)
        username: realName,      // 실제 표시될 이름
        bio: "",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function logOut() {
  return signOut(auth);
}
