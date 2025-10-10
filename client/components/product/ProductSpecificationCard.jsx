import React from "react";

const ProductSpecificationCard = ({ label, value, isOdd = false }) => {
  return (
    <div className={`grid grid-cols-2 py-3 px-4 ${isOdd ? "bg-gray-100" : ""}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
};

export default ProductSpecificationCard;
