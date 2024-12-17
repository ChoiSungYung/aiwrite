import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useUser } from '@/lib/useUser'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pencil, Library, Heart, BookOpen } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [works, setWorks] = useState([])
  const [interactions, setInteractions] = useState([])
  const [libraries, setLibraries] = useState([])

  useEffect(() => {
    if (user) {
      loadProfile()
      loadUserContent()
    } else if (user === null) {
      router.push('/login')
    }
  }, [user])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const loadUserContent = async () => {
    // 작품 목록 로드
    const { data: worksData } = await supabase
      .from('works')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (worksData) {
      setWorks(worksData)
    }

    // 좋아요한 작품 로드
    const { data: likesData } = await supabase
      .from('interactions')
      .select(`
        *,
        work:works(*)
      `)
      .eq('user_id', user.id)
      .eq('interaction_type', 'like')
      .order('created_at', { ascending: false })

    if (likesData) {
      setInteractions(likesData)
    }

    // 서재 목록 로드
    const { data: librariesData } = await supabase
      .from('user_libraries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (librariesData) {
      setLibraries(librariesData)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-8">로딩중...</div>
  }

  if (!profile) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{profile.full_name}</h1>
              {profile.bio && (
                <p className="text-gray-600">{profile.bio}</p>
              )}
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-2" />
                프로필 수정
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <div>작품 {works.length}개</div>
            <div>좋아요한 작품 {interactions.length}개</div>
            <div>서재 {libraries.length}개</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="works" className="space-y-4">
        <TabsList>
          <TabsTrigger value="works" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            내 작품
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            좋아요한 작품
          </TabsTrigger>
          <TabsTrigger value="libraries" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            내 서재
          </TabsTrigger>
        </TabsList>

        <TabsContent value="works" className="space-y-4">
          {works.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {works.map(work => (
                <Card key={work.id} className="flex flex-col">
                  <div className="p-4">
                    <Link 
                      href={`/works/${work.id}`}
                      className="text-lg font-medium hover:text-indigo-600"
                    >
                      {work.title}
                    </Link>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <div>조회 {work.view_count}</div>
                      <div>좋아요 {work.like_count}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 작성한 작품이 없습니다.
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes" className="space-y-4">
          {interactions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {interactions.map(({ work }) => (
                <Card key={work.id} className="flex flex-col">
                  <div className="p-4">
                    <Link 
                      href={`/works/${work.id}`}
                      className="text-lg font-medium hover:text-indigo-600"
                    >
                      {work.title}
                    </Link>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <div>조회 {work.view_count}</div>
                      <div>좋아요 {work.like_count}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 좋아요한 작품이 없습니다.
            </div>
          )}
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4">
          {libraries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {libraries.map(library => (
                <Card key={library.id} className="flex flex-col">
                  <div className="p-4">
                    <Link 
                      href={`/userlib/${library.id}`}
                      className="text-lg font-medium hover:text-indigo-600"
                    >
                      {library.name}
                    </Link>
                    {library.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {library.description}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <div>작품 {library.total_works}</div>
                      <div>팔로워 {library.followers_count}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 생성한 서재가 없습니다.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}