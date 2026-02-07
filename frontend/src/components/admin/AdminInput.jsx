import React from 'react';

const AdminInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full h-12 bg-[#0b0f14] border border-cyan-500/30 rounded-xl px-4 text-white 
                   placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 
                   focus:ring-cyan-400/20 transition-all shadow-inner ${className}`}
        {...props}
      />
    </div>
  );
};

export default AdminInput;
