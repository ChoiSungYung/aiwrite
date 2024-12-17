import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold">
              AI문학관
            </Link>
            <nav className="flex gap-6">
              <Link 
                href="/admin" 
                className={`hover:text-gray-600 ${
                  router.pathname === '/admin' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                대시보드
              </Link>
              <Link 
                href="/admin/books" 
                className={`hover:text-gray-600 ${
                  router.pathname === '/admin/books' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                도서관리
              </Link>
              <Link 
                href="/admin/database" 
                className={`hover:text-gray-600 ${
                  router.pathname === '/admin/database' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                데이터베이스
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}