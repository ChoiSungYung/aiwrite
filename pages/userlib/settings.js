// pages/userlib/settings.js
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function LibrarySettingsPage() {
  const [library, setLibrary] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [theme, setTheme] = useState('default')

  // 로그인 유저 가정
  const user_id = null

  useEffect(() => {
    if (user_id) {
      fetchLibrary()
    }
  }, [user_id])

  const fetchLibrary = async () => {
    const { data } = await supabase
      .from('user_libraries')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (data) {
      setLibrary(data)
      setName(data.name ?? '')
      setDescription(data.description ?? '')
      setIsPublic(data.is_public ?? true)
      setTheme(data.theme ?? 'default')
    }
  }

  const saveSettings = async () => {
    if (!user_id) {
      alert("로그인이 필요합니다.")
      return
    }

    const { error } = await supabase.from('user_libraries').update({
      name,
      description,
      is_public: isPublic,
      theme
    }).eq('user_id', user_id)

    if (error) {
      alert('저장 실패')
    } else {
      alert('저장 성공')
    }
  }

  if (!user_id) {
    return <div className="max-w-3xl mx-auto py-8">로그인이 필요합니다.</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold">서재 설정</h1>
      <input 
        className="border w-full p-2 rounded"
        placeholder="서재 이름"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea 
        className="border w-full p-2 rounded"
        placeholder="서재 소개"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700">공개 여부:</label>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">테마:</label>
        <select className="border p-2 rounded" value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="default">기본</option>
          <option value="dark">다크</option>
          <option value="light">라이트</option>
        </select>
      </div>

      <button onClick={saveSettings} className="bg-blue-500 text-white px-4 py-2 rounded">
        저장
      </button>
    </div>
  )
}
