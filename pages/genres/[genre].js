import { works } from '../../lib/data'
import { useRouter } from 'next/router'
import WorkCard from '../../components/WorkCard'

export default function GenrePage() {
  const router = useRouter()
  const { genre } = router.query
  const filtered = works.filter(w => w.genre === genre)

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{genre} 작품</h2>
      {filtered.length > 0 ? filtered.map(w => <WorkCard key={w.id} work={w} />)
      : <p className="text-gray-600">해당 장르의 작품이 없습니다.</p>}
    </div>
  )
}
