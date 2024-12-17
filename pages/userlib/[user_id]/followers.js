import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function LibraryFollowersPage() {
  const [followers, setFollowers] = useState([]);
  const [library, setLibrary] = useState(null);
  const router = useRouter();
  const { user_id } = router.query;

  useEffect(() => {
    if (user_id) {
      loadLibraryAndFollowers();
    }
  }, [user_id]);

  const loadLibraryAndFollowers = async () => {
    // 서재 정보 로드
    const { data: libraryData } = await supabase
      .from('user_libraries')
      .select(`
        *,
        owner:profiles(full_name)
      `)
      .eq('user_id', user_id)
      .single();

    if (libraryData) {
      setLibrary(libraryData);
    }

    // 팔로워 정보 로드
    const { data: followersData } = await supabase
      .from('library_followers')
      .select(`
        *,
        follower:profiles(id, full_name, bio)
      `)
      .eq('library_id', user_id)
      .order('created_at', { ascending: false });

    if (followersData) {
      setFollowers(followersData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/userlib/${user_id}`} className="text-indigo-600 hover:underline mb-8 inline-block">
        ← 서재로 돌아가기
      </Link>

      {library && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{library.owner?.full_name}님의 서재 팔로워</h1>
          <p className="text-gray-600 mt-2">총 {followers.length}명의 팔로워</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {followers.map(({ follower }) => (
          <Card key={follower.id} className="p-4">
            <Link href={`/profile/${follower.id}`}>
              <h3 className="font-medium text-lg hover:text-indigo-600">
                {follower.full_name}
              </h3>
            </Link>
            {follower.bio && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {follower.bio}
              </p>
            )}
            <div className="mt-4">
              <Link 
                href={`/userlib/${follower.id}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                서재 방문하기
              </Link>
            </div>
          </Card>
        ))}
        {followers.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            아직 팔로워가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}