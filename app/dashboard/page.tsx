// pages/students.tsx

import MainAppLayout from '@/components/MainAppLayout';

const DashboardPage = () => {
  
  return (
    <div>
      <h1>📚 Dashboard Page</h1>
    </div>
  );
};

const Dashboard = () => {
  return (
    <MainAppLayout>
      <DashboardPage />
    </MainAppLayout>
  );
};

export default Dashboard;