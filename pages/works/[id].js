import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useState } from 'react'

// 작품 상세 페이지
export async function getServerSideProps(context) {
  const { id } = context.params

  // works 테이블에서 모든 필요한 정보 가져오기
  const { data: work, error: workError } = await supabase
    .from('works')
    .select('id, title, cover_url, prompt, original_text, variation_prompt, variation_text')
    .eq('id', id)
    .single()

  if (workError || !work) {
    return { notFound: true }
  }

  return {
    props: {
      work
    }
  }
}

export default function WorkDetailPage({ work }) {
  if (!work) {
    return <div className="max-w-3xl mx-auto py-16 text-center">작품을 찾을 수 없습니다.</div>
  }

  const { title, cover_url, prompt, original_text, variation_prompt, variation_text } = work

  // 변주 토글 상태
  const [showVariation, setShowVariation] = useState(false)

  // 현재 표시할 텍스트: 변주 토글이 true면 variation_text, 아니면 original_text
  const displayedText = showVariation ? variation_text : original_text

  // variation_prompt나 variation_text가 없을 수 있으니 안전 장치
  const hasVariation = variation_prompt && variation_text

  const toggleVariation = () => {
    // 만약 변주 데이터가 없다면 토글 불가
    if (!hasVariation) return
    setShowVariation(prev => !prev)
  }

  return (
    <div className="max-w-3xl mx-auto py-16">
      <Link href="/" className="text-indigo-600 hover:underline">
        ← 메인으로 돌아가기
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-4">{title}</h1>
        <img 
          src={cover_url || 'https://via.placeholder.com/200x300?text=No+Cover'}
          alt={title}
          className="mx-auto mb-4 rounded shadow-md w-48 h-auto"
        />
      </div>

      {/* 프롬프트 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">프롬프트 (Prompt)</h2>
        {prompt ? (
          <div className="p-4 bg-gray-100 rounded text-gray-700 whitespace-pre-wrap">
            {prompt}
          </div>
        ) : (
          <p className="text-gray-500">프롬프트 정보가 없습니다.</p>
        )}
      </section>

      {/* 원본/변주 작품 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {showVariation ? 'AI 변주 작품' : 'AI 창작 작품'}
        </h2>
        
        {/* 변주 작품 토글 버튼 */}
        {hasVariation && (
          <div className="mb-4">
            <button
              onClick={toggleVariation}
              className={
                "px-4 py-2 rounded border " +
                (showVariation ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100")
              }
            >
              {showVariation ? '원본으로 돌아가기' : variation_prompt}
            </button>
          </div>
        )}

        {displayedText ? (
          <div className="p-4 bg-white shadow rounded text-gray-800 whitespace-pre-wrap leading-relaxed">
            {displayedText}
          </div>
        ) : (
          <p className="text-gray-500">원본 작품이 없습니다.</p>
        )}
      </section>
    </div>
  )
}
