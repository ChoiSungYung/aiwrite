// pages/theme/[theme].jsx
import { useState, useEffect } from 'react';
import { works } from '../../lib/data'
import { useRouter } from 'next/router'
import WorkCard from '../../components/WorkCard'

export default function ThemePage() {
  const [data, setData] = useState([]); // 초기값 빈 배열
  const router = useRouter()
  const { theme } = router.query

  useEffect(() => {
    if (theme) {
      const filtered = works.filter(w => w.themes.includes(theme))
      setData(filtered)
    }
  }, [theme])

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">"{theme}" 테마 작품</h2>
      {data.length > 0 ? data.map(w => <WorkCard key={w.id} work={w} />)
      : <p className="text-gray-600">해당 테마의 작품이 없습니다.</p>}
    </div>
  )
}