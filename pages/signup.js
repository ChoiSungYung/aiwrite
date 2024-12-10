import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })
    if (signUpError) {
      setErrorMsg(signUpError.message)
    } else {
      // 회원가입 성공, user.id를 얻어 profiles 테이블에 기본 레코드 삽입
      const user = signUpData.user
      if (user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: user.id, full_name: '', bio: '' }
        ])
        if (profileError) {
          console.error('프로필 생성 실패:', profileError.message)
        }
      }
      router.push('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
      <form onSubmit={handleSignup} className="space-y-4">
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
          회원가입
        </button>
      </form>
      <p className="mt-4">
        이미 회원이신가요? <a href="/login" className="text-indigo-600 hover:underline">로그인</a>
      </p>
    </div>
  )
}
