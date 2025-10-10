import React from "react";

const ProductInfoCard = ({ info }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
      <p className="text-gray-700 text-sm leading-relaxed">{info}</p>
    </div>
  );
};

export default ProductInfoCard;
