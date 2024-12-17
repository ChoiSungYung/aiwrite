// pages/userlib/[user_id].js

import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function UserLibraryPage() {
  const router = useRouter()
  const { user_id } = router.query
  const [session, setSession] = useState(null)
  const [library, setLibrary] = useState(null)
  const [works, setWorks] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!router.isReady || !user_id) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        await fetchData(user_id, session.user.id)
        setLoading(false)
      }
    })
  }, [router, user_id])

  const fetchData = async (libraryUserId, currentUserId) => {
    // 서재 정보 (profile 제외)
    const { data: libraryData, error: libError } = await supabase
      .from('user_libraries')
      .select('*')
      .eq('user_id', libraryUserId)
      .single()

    if (libError || !libraryData) {
      console.error('서재 불러오기 실패:', libError)
      setLibrary(null)
      return
    }

    setLibrary(libraryData)
    // 현재 유저가 서재 주인인지 판별
    setIsOwner(libraryData.user_id === currentUserId)

    // 작품 목록
    const { data: worksData, error: worksError } = await supabase
      .from('works')
      .select('*')
      .eq('library_id', libraryData.id)

    if (!worksError) {
      setWorks(worksData ?? [])
    }

    // 팔로워 정보
    const { data: followersData, error: followersError } = await supabase
      .from('library_followers')
      .select('follower_id, created_at')
      .eq('library_id', libraryData.id)

    if (!followersError) {
      setFollowers(followersData ?? [])
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto py-8">로딩중...</div>
  }

  if (!library) {
    return <div className="max-w-3xl mx-auto py-8">존재하지 않는 서재입니다.</div>
  }

  const handleAddWork = () => {
    // "작품 추가" 버튼 클릭 시 작품 생성 페이지(/works/create)로 이동
    // 실제 구현시 /works/create?library_id=... 등으로 해당 라이브러리 정보 전달 가능
    router.push('/works/create')
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {library.banner_url && (
        <img src={library.banner_url} alt={library.name} className="w-full h-48 object-cover rounded mb-4"/>
      )}
      <h1 className="text-2xl font-bold mb-2">{library.name}</h1>
      {library.description && <p className="text-gray-700 mb-4">{library.description}</p>}
      <div className="flex space-x-4 text-sm text-gray-600 mb-8">
        <span>작품 수: {library.total_works}</span>
        <span>팔로워: {library.followers_count}</span>
        <span>총 조회: {library.total_views}</span>
        <span>총 좋아요: {library.total_likes}</span>
      </div>

      {/* 서재 주인일 경우에만 작품 추가 버튼 표시 */}
      {isOwner && (
        <div className="mb-4">
          <button 
            onClick={handleAddWork}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            작품 추가
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">작품 목록</h2>
      <div className="space-y-2 mb-8">
        {works.map(work => (
          <a key={work.id} href={`/works/${work.id}`} className="block border rounded p-2 hover:bg-gray-50">
            {work.title}
          </a>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">팔로워</h2>
      <div className="space-y-1">
        {followers.map(f => (
          <div key={f.follower_id} className="text-sm text-gray-700">
            팔로워 ID: {f.follower_id} (팔로우 일자: {new Date(f.created_at).toLocaleDateString()})
          </div>
        ))}
      </div>
    </div>
  )
}
