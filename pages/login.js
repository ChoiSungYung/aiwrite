import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      // 로그인 성공 시 홈으로 이동 또는 원하는 페이지로 이동
      router.push('/')
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">이메일</label>
          <input 
            type="email" 
            className="border border-gray-300 rounded w-full p-2"
            value={email}
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1">비밀번호</label>
          <input 
            type="password" 
            className="border border-gray-300 rounded w-full p-2"
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition"
        >
          로그인
        </button>
      </form>
      <p className="mt-4">
        아직 회원이 아니신가요? <a href="/signup" className="text-indigo-600 hover:underline">회원가입</a>
      </p>
    </div>
  )
}
