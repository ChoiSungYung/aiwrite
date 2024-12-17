import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export async function getServerSideProps(context) {
  const { id } = context.params

  // works 테이블에서 정보 가져오기
  const { data: work, error: workError } = await supabase
    .from('works')
    .select(`
      id, 
      title, 
      cover_url, 
      prompt, 
      original_text, 
      variation_prompt, 
      variation_text,
      user_id,
      like_count,
      view_count,
      created_at,
      user:profiles!user_id(full_name)
    `)
    .eq('id', id)
    .single()

  // 댓글 정보 가져오기
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles(full_name)
    `)
    .eq('work_id', id)
    .order('created_at', { ascending: false })

  if (workError || !work) {
    return { notFound: true }
  }

  return {
    props: {
      work,
      initialComments: comments || []
    }
  }
}

export default function WorkDetailPage({ work, initialComments }) {
  const [showVariation, setShowVariation] = useState(false)
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(work?.like_count || 0)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 현재 로그인한 사용자 정보 가져오기
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (user && work) {
      checkLikeStatus()
    }
  }, [user, work])

  if (!work) {
    return <div className="max-w-3xl mx-auto py-16 text-center">작품을 찾을 수 없습니다.</div>
  }

  const { 
    title, 
    cover_url, 
    prompt, 
    original_text, 
    variation_prompt, 
    variation_text, 
    user: author 
  } = work

  const displayedText = showVariation ? variation_text : original_text
  const hasVariation = variation_prompt && variation_text

  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from('interactions')
      .select('*')
      .eq('work_id', work.id)
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')
      .single()

    setIsLiked(!!data)
  }

  const toggleLike = async () => {
    if (!user) {
      alert('좋아요를 하려면 로그인이 필요합니다.')
      return
    }

    if (isLiked) {
      await supabase
        .from('interactions')
        .delete()
        .match({ 
          work_id: work.id,
          user_id: user.id,
          interaction_type: 'like'
        })
      setLikeCount(prev => prev - 1)
    } else {
      await supabase
        .from('interactions')
        .insert({
          work_id: work.id,
          user_id: user.id,
          interaction_type: 'like'
        })
      setLikeCount(prev => prev + 1)

      // 알림 생성
      if (work.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: work.user_id,
            type: 'like',
            content: `${user.user_metadata?.full_name || 'Someone'}님이 작품을 좋아합니다.`,
            work_id: work.id,
            actor_id: user.id
          })
      }
    }
    setIsLiked(!isLiked)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다.')
      return
    }
    if (!newComment.trim()) return

    setSubmitting(true)
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        work_id: work.id,
        user_id: user.id,
        content: newComment.trim()
      })
      .select('*, profile:profiles(full_name)')
      .single()

    if (!error && comment) {
      setComments([comment, ...comments])
      setNewComment('')

      // 알림 생성
      if (work.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: work.user_id,
            type: 'comment',
            content: `${user.user_metadata?.full_name || 'Someone'}님이 댓글을 남겼습니다.`,
            work_id: work.id,
            actor_id: user.id
          })
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <Link href="/" className="text-indigo-600 hover:underline">
        ← 메인으로 돌아가기
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-4">{title}</h1>
        {author && (
          <p className="text-gray-600 mb-4">by {author.full_name}</p>
        )}
        <img 
          src={cover_url || 'https://via.placeholder.com/200x300?text=No+Cover'}
          alt={title}
          className="mx-auto mb-4 rounded shadow-md w-48 h-auto"
        />
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleLike}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isLiked 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likeCount}
          </button>
          <div className="flex items-center gap-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {comments.length}
          </div>
        </div>
      </div>

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

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {showVariation ? 'AI 변주 작품' : 'AI 창작 작품'}
        </h2>
        
        {hasVariation && (
          <div className="mb-4">
            <button
              onClick={() => setShowVariation(prev => !prev)}
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

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">댓글</h2>

        {/* 댓글 작성 폼 */}
        {user ? (
          <div className="bg-white rounded-lg shadow mb-6">
            <form onSubmit={handleSubmitComment} className="p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요"
                className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
              <div className="mt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow mb-6 p-4 text-center">
            <p className="text-gray-600">
              댓글을 작성하려면 
              <Link href="/login" className="text-indigo-600 hover:underline mx-1">
                로그인
              </Link>
              이 필요합니다.
            </p>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.profile?.full_name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}