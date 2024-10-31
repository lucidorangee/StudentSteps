import React from 'react';

const StudentInfoField = ({ label, value, onChange, isEditable }) => {
  return (
    <div className="student-info-field">
      <label>{label}</label>
      {isEditable ? (
        <input type="text" value={value} onChange={onChange} />
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
};

export default StudentInfoField;
