import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@/lib/useUser'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProfileEditPage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    } else if (user === null) {
      router.push('/login')
    }
  }, [user])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        bio: data.bio || ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        updated_at: new Date()
      })
      .eq('id', user.id)

    setLoading(false)

    if (!error) {
      router.push('/profile')
    } else {
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!user) return null

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">프로필 수정</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              이름
            </label>
            <input
              type="text"
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              소개
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="자기소개를 입력하세요"
              rows="4"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/profile')}
            >
              취소
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}