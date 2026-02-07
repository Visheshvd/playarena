import React from 'react';

const AdminCard = ({ 
  children, 
  title,
  className = '',
  noPadding = false
}) => {
  return (
    <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-cyan-500/20">
          <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default AdminCard;
