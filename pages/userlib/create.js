// pages/userlib/create.js

import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function CreateLibraryPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 클라이언트에서 세션 확인
    supabase.auth.getSession().then(({ data: { session }}) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
      }
    })
  }, [router])

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("서재 이름을 입력해주세요.")
      return
    }

    if (!session) {
      // 세션이 없으면 진행 불가
      alert("로그인 상태를 확인 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('user_libraries')
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        description: description.trim() || null,
        banner_url: bannerUrl.trim() || null,
        is_public: isPublic
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      console.error(error)
      alert("서재 생성 중 오류가 발생했습니다.")
      return
    }

    // 생성된 서재 상세 페이지로 이동
    router.push(`/userlib/${session.user.id}`)
  }

  // session 정보 로딩 중이면 로딩화면 표시
  if (!session) {
    return <div className="max-w-md mx-auto py-8">로딩중...</div>
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">새 서재 만들기</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold text-gray-700">서재 이름</label>
        <input 
          type="text" 
          className="border w-full p-2 rounded" 
          placeholder="예: 미래의서재"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold text-gray-700">서재 소개</label>
        <textarea 
          className="border w-full p-2 rounded h-24" 
          placeholder="서재에 대해 소개해보세요."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold text-gray-700">배너 이미지 URL</label>
        <input 
          type="text" 
          className="border w-full p-2 rounded" 
          placeholder="https://example.com/banner.jpg" 
          value={bannerUrl}
          onChange={e => setBannerUrl(e.target.value)}
        />
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={isPublic} 
          onChange={e => setIsPublic(e.target.checked)}
        />
        <label className="text-gray-700">공개 여부 (체크 시 다른 유저에게도 공개)</label>
      </div>

      <button 
        onClick={handleCreate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? '생성 중...' : '서재 생성'}
      </button>
    </div>
  )
}
