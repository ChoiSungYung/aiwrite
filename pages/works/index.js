import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function WorksPage() {
  const [works, setWorks] = useState([]);
  const [genreFilter, setGenreFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');

  useEffect(() => {
    supabase
      .from('works')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setWorks(data || []);
      });
  }, []);

  const filteredWorks = works.filter(work => {
    const genreMatch = genreFilter ? work.genre === genreFilter : true;
    const themeMatch = themeFilter ? (work.themes || []).includes(themeFilter) : true;
    return genreMatch && themeMatch;
  });

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">모든 작품</h2>
      <div className="flex space-x-4 mb-6">
        <select
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          <option value="">장르 전체</option>
          <option value="시">시</option>
          <option value="소설">소설</option>
          <option value="에세이">에세이</option>
        </select>

        <select
          value={themeFilter}
          onChange={e => setThemeFilter(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          <option value="">테마 전체</option>
          <option value="인간성">인간성</option>
          <option value="자연">자연</option>
          <option value="미래">미래</option>
          <option value="유머">유머</option>
        </select>
      </div>
      {filteredWorks.length > 0 ? (
        filteredWorks.map(work => (
          <div key={work.id} className="border border-gray-300 bg-white rounded p-4 mb-4 shadow-sm hover:shadow-md transition">
            {work.cover_url && (
              <div className="mb-2">
                <img src={work.cover_url} alt={`${work.title} 표지`} className="h-40 w-auto object-cover" />
              </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{work.title}</h3>
            <p className="text-sm text-gray-600">장르: {work.genre}</p>
            <p className="text-sm text-gray-600">테마: {(work.themes || []).join(", ")}</p>
            <p className="text-sm text-gray-700 my-2">{work.description}</p>
            <Link href={`/works/${work.id}`} className="text-indigo-600 hover:underline font-medium">자세히 보기 →</Link>
          </div>
        ))
      ) : (
        <p className="text-gray-600">해당 조건의 작품이 없습니다.</p>
      )}
    </div>
  )
}
