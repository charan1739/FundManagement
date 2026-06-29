import React from 'react';

const TabBar = ({ tabs, activeTab, onTabChange }) => (
  <div className="tab-bar overflow-x-auto no-scrollbar flex-shrink-0">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`tab-item flex-shrink-0 px-4 ${activeTab === tab ? 'active' : 'inactive'}`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default TabBar;
