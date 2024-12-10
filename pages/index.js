import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useRef, useEffect, useState } from 'react'

export async function getServerSideProps() {
  const { data: works, error } = await supabase
    .from('works')
    .select('*')

  if (error) {
    console.error('Error fetching works:', error)
    return {
      props: {
        categories: []
      }
    }
  }

  function filterByTheme(theme) {
    return works.filter(work => work.themes && work.themes.includes(theme))
  }

  const categories = [
    { name: '미래', works: filterByTheme('미래') },
    { name: '인간성', works: filterByTheme('인간성') },
    { name: '자연', works: filterByTheme('자연') }
  ]

  return {
    props: {
      categories: categories || []
    }
  }
}

export default function Home({ categories }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-4">GPT-5 문학관</h1>
      <p className="text-lg text-gray-700 mb-8">
        GPT-5가 창작한 다양한 문학 작품을 장르, 테마, 스타일 별로 감상해보세요.
      </p>
      <div className="space-x-4 mb-8">
        <Link href="/works" className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-500 transition">
          작품 전체보기
        </Link>
        <Link href="/login" className="inline-block px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition">
          로그인
        </Link>
        <Link href="/signup" className="inline-block px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition">
          회원가입
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-12">로그인을 하시면 더 많은 기능을 이용하실 수 있습니다.</p>

      <div className="space-y-12">
        {categories.map((category, idx) => (
          <ThemeCarousel key={idx} category={category} />
        ))}
      </div>
    </div>
  )
}

function ThemeCarousel({ category }) {
  const scrollContainerRef = useRef(null)
  const ITEM_WIDTH = 208 

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || category.works.length === 0) return

    let interval = setInterval(() => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth
      if (container.scrollLeft + ITEM_WIDTH > maxScrollLeft + 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [ITEM_WIDTH, category.works])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -ITEM_WIDTH, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth
      if (container.scrollLeft + ITEM_WIDTH > maxScrollLeft + 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center mb-4">
        <div className="border-t border-gray-300 w-16 mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">{category.name} 테마 도서</h2>
        <div className="border-t border-gray-300 w-16 ml-3"></div>
      </div>
      {category.works.length > 0 ? (
        <div className="overflow-hidden relative group">
          <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-opacity-100 transition opacity-0 group-hover:opacity-100"
            onClick={scrollLeft}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-opacity-100 transition opacity-0 group-hover:opacity-100"
            onClick={scrollRight}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div 
            ref={scrollContainerRef} 
            className="flex space-x-4 pb-4 overflow-x-scroll no-scrollbar scroll-smooth relative"
            style={{ scrollbarWidth: 'none' }}
          >
            {category.works.map((work) => (
              <BookCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">해당 테마의 작품이 없습니다.</p>
      )}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function BookCard({ work }) {
  const [loaded, setLoaded] = useState(false)
  const coverUrl = work.cover_url || 'https://via.placeholder.com/200x300?text=No+Cover'

  return (
    <Link href={`/works/${work.id}`}>
      <div className="inline-block w-48 flex-shrink-0 transform hover:scale-105 hover:rotate-2 hover:shadow-lg transition cursor-pointer relative">
        {/* 스켈레톤: 이미지와 텍스트 자리를 미리 잡아두는 블록 */}
        {!loaded && (
          <div className="animate-pulse">
            <div className="w-full h-[300px] bg-gray-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        )}

        {/* 실제 이미지 & 텍스트 (로드 완료 시 표시) */}
        <img 
          src={coverUrl} 
          alt={work.title} 
          className={`rounded shadow-md mb-2 w-full h-auto ${loaded ? 'block' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
        />
        {loaded && (
          <p className="text-gray-700 text-sm font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
            {work.title}
          </p>
        )}
      </div>
    </Link>
  )
}
