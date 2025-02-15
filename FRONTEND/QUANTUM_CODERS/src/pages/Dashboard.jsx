import React from 'react';
import DashboardContent from '@/partials/DashboardContent';

const Dashboard = () => {
  return (
    <div>
      <DashboardContent 
        isDarkMode={false} // or true based on your state
        recentChallenges={[]} // Pass actual data
        guildInformation={[]} // Pass actual data
      />
    </div>
  );
};

export default Dashboard;