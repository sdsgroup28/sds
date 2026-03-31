import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'react-hot-toast';

// Globally seamlessly convert all system alerts into elegant UI toasts
window.alert = (message) => {
  const str = message ? message.toString().toLowerCase() : '';
  if (str.includes('error') || str.includes('failed') || str.includes('please select') || str.includes('not found')) {
    toast.error(message, { duration: 4000, position: 'top-right' });
  } else {
    toast.success(message, { duration: 4000, position: 'top-right' });
  }
};

// Layout
import DashboardLayout from './components/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Houses from './pages/admin/Houses';
import MaintenanceAdmin from './pages/admin/MaintenanceAdmin';
import ComplaintsAdmin from './pages/admin/ComplaintsAdmin';
import Reports from './pages/admin/Reports';
import ReligiousFunds from './pages/admin/ReligiousFunds';
import NoticesAdmin from './pages/admin/NoticesAdmin';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyMaintenance from './pages/owner/MyMaintenance';
import MyComplaints from './pages/owner/MyComplaints';
import MyProfile from './pages/owner/MyProfile';
import NoticeBoard from './pages/owner/NoticeBoard';
import MyReligiousFunds from './pages/owner/MyReligiousFunds';

// Welcome Screen
import Welcome from './pages/Welcome';

function App() {
  return (
    <Router>
      <Toaster />
      <SignedOut>
        <Welcome />
      </SignedOut>
      
      <SignedIn>
        <RoleRouter />
      </SignedIn>
    </Router>
  );
}

function RoleRouter() {
  const { user } = useUser();
  // Role logic: check public metadata, or default to owner.
  // For demo: if email contains 'admin', treat as admin. You can configure this in Clerk Dashboard.
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.primaryEmailAddress?.emailAddress?.includes('admin');

  return (
    <DashboardLayout isAdmin={isAdmin}>
      {isAdmin ? (
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/houses" element={<Houses />} />
          <Route path="/maintenance" element={<MaintenanceAdmin />} />
          <Route path="/complaints" element={<ComplaintsAdmin />} />
          <Route path="/religious-funds" element={<ReligiousFunds />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notices" element={<NoticesAdmin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<OwnerDashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-maintenance" element={<MyMaintenance />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/notices" element={<NoticeBoard />} />
          <Route path="/religious-funds" element={<MyReligiousFunds />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </DashboardLayout>
  );
}

export default App;
