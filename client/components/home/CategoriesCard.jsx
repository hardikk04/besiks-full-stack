import Image from "next/image";
import React from "react";

const CategoriesCard = ({title,img}) => {
  return (
    <div className="text-center">
      <div className="h-32 w-42 overflow-hidden rounded-xl">
        <Image
          src={img}
          alt={title}
          height={500}
          width={500}
          className="h-full w-full object-cover"
        ></Image>
      </div>
      <p className="font-semibold">{title}</p>
    </div>
  );
};

export default CategoriesCard;
