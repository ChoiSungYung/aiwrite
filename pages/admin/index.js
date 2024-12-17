import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/books">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">도서 관리</h2>
            <p className="text-gray-600">도서 정보를 등록하고 관리합니다.</p>
          </div>
        </Link>

        <Link href="/admin/database">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-2">데이터베이스</h2>
            <p className="text-gray-600">시스템의 데이터베이스 정보를 관리합니다.</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
}