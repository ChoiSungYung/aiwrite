import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Heart, MessageSquare, Eye } from 'lucide-react'

export async function getServerSideProps({ params }) {
  const { genre } = params
  
  const { data: works } = await supabase
    .from('works')
    .select(`
      *,
      author:profiles!user_id(full_name),
      library:user_libraries(name)
    `)
    .eq('genre', decodeURIComponent(genre))
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return {
    props: {
      works: works || [],
      genre: decodeURIComponent(genre)
    }
  }
}

export default function GenrePage({ works, genre }) {
  const [sortBy, setSortBy] = useState('recent')
  const router = useRouter()

  const getSortedWorks = () => {
    switch (sortBy) {
      case 'views':
        return [...works].sort((a, b) => b.view_count - a.view_count)
      case 'likes':
        return [...works].sort((a, b) => b.like_count - a.like_count)
      case 'recent':
      default:
        return works
    }
  }

  const sortedWorks = getSortedWorks()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:underline mb-4 inline-block">
          ← 메인으로
        </Link>
        <h1 className="text-3xl font-bold">{genre} 장르의 작품들</h1>
        <p className="text-gray-600 mt-2">총 {works.length}개의 작품</p>
      </div>

      <div className="mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="recent">최신순</option>
          <option value="views">조회수순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedWorks.map(work => (
          <Card key={work.id} className="flex flex-col">
            <div className="relative aspect-w-3 aspect-h-2">
              {work.cover_url ? (
                <img
                  src={work.cover_url}
                  alt={work.title}
                  className="w-full h-48 object-cover rounded-t"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-t flex items-center justify-center text-gray-400">
                  No Cover
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              <Link 
                href={`/works/${work.id}`}
                className="text-xl font-semibold hover:text-indigo-600"
              >
                {work.title}
              </Link>
              {work.author && (
                <p className="text-gray-600 mt-1">
                  by {work.author.full_name}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {work.view_count || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {work.like_count || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {work.comment_count || 0}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          아직 이 장르의 작품이 없습니다.
        </div>
      )}
    </div>
  )
}