import AdminLayout from '../../components/admin/AdminLayout';
import AdminBookManager from '../../components/admin/AdminBookManager';

export default function AdminBooksPage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">도서 관리</h1>
      <AdminBookManager />
    </AdminLayout>
  );
}