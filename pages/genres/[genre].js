// pages/genre/[genre].jsx
import { useState, useEffect } from 'react';
import { works } from '../../lib/data'
import { useRouter } from 'next/router'
import WorkCard from '../../components/WorkCard'

export default function GenrePage() {
  const [data, setData] = useState([]); // 초기값 빈 배열
  const router = useRouter()
  const { genre } = router.query

  useEffect(() => {
    if (genre) {
      const filtered = works.filter(w => w.genre === genre)
      setData(filtered)
    }
  }, [genre])

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{genre} 작품</h2>
      {data.length > 0 ? data.map(w => <WorkCard key={w.id} work={w} />)
      : <p className="text-gray-600">해당 장르의 작품이 없습니다.</p>}
    </div>
  )
}