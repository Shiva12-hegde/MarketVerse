import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function DashboardLayout({ sidebar }) {
  return (
    <div className="container-app flex flex-1 gap-6 py-6">
      <aside className="hidden w-56 shrink-0 lg:block">{sidebar}</aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
