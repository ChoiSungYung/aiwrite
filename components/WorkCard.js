import Link from 'next/link'

export default function WorkCard({ work }) {
  return (
    <div className="border border-gray-300 bg-white rounded p-4 mb-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{work.title}</h3>
      <p className="text-sm text-gray-600">장르: {work.genre}</p>
      <p className="text-sm text-gray-600">테마: {work.themes.join(", ")}</p>
      <p className="text-sm text-gray-700 my-2">{work.description}</p>
      <Link href={`/works/${work.id}`} className="text-indigo-600 hover:underline font-medium">
        자세히 보기 →
      </Link>
    </div>
  )
}
