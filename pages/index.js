import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useRef, useEffect, useState } from 'react'

export async function getServerSideProps() {
  // works 전체 불러오기
  const { data: works, error: worksError } = await supabase
    .from('works')
    .select('*')

  if (worksError) {
    console.error('Error fetching works:', worksError)
    return { props: { categories: [], latestWorks: [], popularWorks: [], recommendedLibraries: [] } }
  }

  // 테마별 필터 함수
  function filterByTheme(theme) {
    return works.filter(work => work.themes && work.themes.includes(theme))
  }

  const categories = [
    { name: '미래', works: filterByTheme('미래') },
    { name: '인간성', works: filterByTheme('인간성') },
    { name: '자연', works: filterByTheme('자연') }
  ]

  // 최신 작품 (최대 5개, created_at 내림차순)
  const { data: latestWorks } = await supabase
    .from('works')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // 인기 작품 (최대 5개, like_count 내림차순)
  const { data: popularWorks } = await supabase
    .from('works')
    .select('*')
    .order('like_count', { ascending: false })
    .limit(5)

  // 추천 서재 (최대 3개, followers_count 내림차순)
  const { data: recommendedLibraries } = await supabase
    .from('user_libraries')
    .select('*')
    .eq('is_public', true)
    .order('followers_count', { ascending: false })
    .limit(3)

  return {
    props: {
      categories: categories || [],
      latestWorks: latestWorks ?? [],
      popularWorks: popularWorks ?? [],
      recommendedLibraries: recommendedLibraries ?? []
    }
  }
}

export default function Home({ categories, latestWorks, popularWorks, recommendedLibraries }) {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-4 text-center">GPT-5 문학관</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">GPT-5가 창작한 다양한 문학 작품을 감상해보세요.</p>
      
      <div className="space-x-4 mb-8 text-center">
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
      <p className="text-sm text-gray-500 mb-12 text-center">로그인을 하시면 더 많은 기능을 이용하실 수 있습니다.</p>

      {/* 최신 작품 피드 캐러셀 */}
      <CarouselSection title="최신 작품 피드" items={latestWorks} itemType="work" />

      {/* 인기 작품 캐러셀 */}
      <CarouselSection title="인기 작품" items={popularWorks} itemType="work" />

      {/* 추천 서재 캐러셀 */}
      <CarouselSection title="추천 서재" items={recommendedLibraries} itemType="library" />

      {/* 테마별 작품 캐러셀 */}
      {categories.map((category, idx) => (
        <CarouselSection key={idx} title={`${category.name} 테마 도서`} items={category.works} itemType="work"/>
      ))}
    </div>
  )
}
function CarouselSection({ title, items, itemType }) {
  const scrollContainerRef = useRef(null)
  const ITEM_WIDTH = 208

  // 한 페이지를 채울 정도로 아이템이 없으면(여기서는 임의로 4개 미만),
  // 무한 스크롤 및 복제 없이 그대로 보여줌
  const canScroll = items.length >= 4

  // canScroll 조건일 때만 무한 스크롤을 위해 두 번 반복
  const displayItems = canScroll ? [...items, ...items] : items

  useEffect(() => {
    if (!canScroll) return
    const container = scrollContainerRef.current
    if (!container || displayItems.length === 0) return

    const maxScrollDistance = ITEM_WIDTH * items.length
    let interval = setInterval(() => {
      container.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' })

      setTimeout(() => {
        if (container.scrollLeft >= maxScrollDistance) {
          container.scrollLeft = container.scrollLeft - maxScrollDistance
        }
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [ITEM_WIDTH, items, displayItems, canScroll])

  const scrollLeft = () => {
    if (!canScroll) return
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -ITEM_WIDTH, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (!canScroll) return
    const container = scrollContainerRef.current
    if (container) {
      const maxScrollDistance = ITEM_WIDTH * items.length
      container.scrollBy({ left: ITEM_WIDTH, behavior: 'smooth' })
      setTimeout(() => {
        if (container.scrollLeft >= maxScrollDistance) {
          container.scrollLeft = container.scrollLeft - maxScrollDistance
        }
      }, 500)
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-center mb-4">
        <div className="border-t border-gray-300 w-16 mr-3"></div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="border-t border-gray-300 w-16 ml-3"></div>
      </div>
      {displayItems.length > 0 ? (
        <div className="overflow-hidden relative group">
          {canScroll && (
            <>
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
            </>
          )}

          <div 
            ref={scrollContainerRef} 
            className="flex space-x-4 pb-4 overflow-x-scroll no-scrollbar scroll-smooth relative"
            style={{ scrollbarWidth: 'none' }}
          >
            {displayItems.map((item, index) => 
              itemType === 'work' ? <WorkCard key={`${item.id}-${index}`} work={item}/> : <LibraryCard key={`${item.id}-${index}`} library={item} />
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">데이터가 없습니다.</p>
      )}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
function WorkCard({ work }) {
  const [loaded, setLoaded] = useState(false)
  const coverUrl = work.cover_url || 'https://via.placeholder.com/200x300?text=No+Cover'

  return (
    <Link href={`/works/${work.id}`}>
      <div className="inline-block w-48 flex-shrink-0 transform hover:scale-105 hover:rotate-2 hover:shadow-lg transition cursor-pointer relative">
        {!loaded && (
          <div className="animate-pulse">
            <div className="w-full h-[300px] bg-gray-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        )}
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

function LibraryCard({ library }) {
  const [loaded, setLoaded] = useState(false)
  const bannerUrl = library.banner_url || 'https://via.placeholder.com/200x100?text=No+Banner'

  return (
    <Link href={`/userlib/${library.user_id}`}>
      <div className="inline-block w-48 flex-shrink-0 transform hover:scale-105 hover:-rotate-1 hover:shadow-lg transition cursor-pointer relative">
        {!loaded && (
          <div className="animate-pulse">
            <div className="w-full h-[100px] bg-gray-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          </div>
        )}
        <img 
          src={bannerUrl} 
          alt={library.name} 
          className={`rounded shadow-md mb-2 w-full h-auto ${loaded ? 'block' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
        />
        {loaded && (
          <p className="text-gray-700 text-sm font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
            {library.name}
          </p>
        )}
      </div>
    </Link>
  )
}
