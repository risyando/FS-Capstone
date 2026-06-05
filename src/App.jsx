import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyOtp from './pages/VerifyOtp.jsx';
import CvUpload from './pages/CvUpload.jsx';
import ShareExperience from './pages/ShareExperience.jsx';
import GenerateCv from './pages/GenerateCv.jsx';
import GenerateCoverLetter from './pages/GenerateCoverLetter.jsx';
import Predict from './pages/Predict.jsx';
import SkillGap from './pages/SkillGap.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminCompanies from './pages/admin/Companies.jsx';
import AdminJobs from './pages/admin/Jobs.jsx';
import AdminApprovals from './pages/admin/Approvals.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminPartners from './pages/admin/Partners.jsx';
import AdminExperiences from './pages/admin/Experiences.jsx';
import AdminMaintenance from './pages/admin/Maintenance.jsx';
import CompanyDashboard from './pages/company/Dashboard.jsx';
import CompanyPostJob from './pages/company/PostJob.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with main layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/cv" element={<CvUpload />} />
          <Route path="/share-experience" element={<ShareExperience />} />
          <Route path="/generate-cv" element={<GenerateCv />} />
          <Route path="/generate-cover-letter" element={<GenerateCoverLetter />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/company/post-job" element={<CompanyPostJob />} />
        </Route>
        {/* Admin routes with admin layout */}
        <Route path="/admin" element={<AdminLayout active="dashboard" />}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/companies" element={<AdminLayout active="companies" />}>
          <Route index element={<AdminCompanies />} />
        </Route>
        <Route path="/admin/jobs" element={<AdminLayout active="jobs" />}>
          <Route index element={<AdminJobs />} />
        </Route>
        <Route path="/admin/approvals" element={<AdminLayout active="approvals" />}>
          <Route index element={<AdminApprovals />} />
        </Route>
        <Route path="/admin/users" element={<AdminLayout active="users" />}>
          <Route index element={<AdminUsers />} />
        </Route>
        <Route path="/admin/partners" element={<AdminLayout active="partners" />}>
          <Route index element={<AdminPartners />} />
        </Route>
        <Route path="/admin/experiences" element={<AdminLayout active="experiences" />}>
          <Route index element={<AdminExperiences />} />
        </Route>
        <Route path="/admin/maintenance" element={<AdminLayout active="maintenance" />}>
          <Route index element={<AdminMaintenance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
