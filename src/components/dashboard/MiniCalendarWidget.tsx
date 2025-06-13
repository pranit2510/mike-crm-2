import React from 'react';

const MiniCalendarWidget = () => {
  // This would ideally integrate a small calendar library or custom implementation
  // For now, a simple placeholder
  return (
    <div className='bg-white p-6 rounded-lg shadow h-full'>
      <h3 className='text-xl font-semibold text-gray-800 mb-4'>Calendar</h3>
      <div className='flex items-center justify-center h-48 bg-gray-50 rounded-md'>
        <p className='text-gray-400'>Mini-Calendar Placeholder</p>
      </div>
      {/* Add functionality to highlight days with jobs */}
    </div>
  );
};

export default MiniCalendarWidget; 