import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 현재 세션 상태 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 세션 변경 시에도 업데이트할 수 있도록 리스너 추가
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <Link href="/" className="text-xl font-bold text-indigo-600 hover:underline">
        GPT-5 문학관
      </Link>
      <div className="space-x-4 text-gray-700 flex items-center">
        <Link href="/works" className="hover:text-indigo-500 hover:underline">작품 전체보기</Link>
        {session ? (
          <>
            <Link href="/profile" className="hover:text-indigo-500 hover:underline">내 프로필</Link>
            <Link href="/admin" className="hover:text-indigo-500 hover:underline">관리자</Link>
            <button onClick={handleLogout} className="hover:text-indigo-500 hover:underline">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-indigo-500 hover:underline">로그인</Link>
            <Link href="/signup" className="hover:text-indigo-500 hover:underline">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}