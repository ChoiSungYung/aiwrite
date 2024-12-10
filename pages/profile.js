import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 현재 세션(로그인 상태) 확인
    supabase.auth.getSession().then(({ data: { session }}) => {
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        fetchProfile(session.user.id)
      }
    })
  }, [router])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, bio')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('프로필 불러오기 실패:', error)
    } else {
      setFullName(data.full_name || '')
      setBio(data.bio || '')
    }
    setLoading(false)
  }

  async function updateProfile(e) {
    e.preventDefault()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio: bio, updated_at: new Date() })
      .eq('id', session.user.id)

    if (error) {
      console.error('프로필 업데이트 실패:', error.message)
      setMessage('프로필 업데이트 실패')
    } else {
      setMessage('프로필이 업데이트되었습니다.')
    }
  }

  if (loading) {
    return <div className="max-w-md mx-auto py-8">로딩중...</div>
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">내 프로필</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input 
            type="text" 
            className="border border-gray-300 rounded w-full p-2"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">소개</label>
          <textarea 
            className="border border-gray-300 rounded w-full p-2"
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition"
        >
          프로필 업데이트
        </button>
      </form>
    </div>
  )
}
