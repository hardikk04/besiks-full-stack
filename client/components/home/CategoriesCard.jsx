import Image from "next/image";
import React from "react";

const CategoriesCard = ({title,img}) => {
  return (
    <div className="text-center w-full">
      <div className="h-20 w-full md:h-32 md:w-42 overflow-hidden rounded-xl">
        <Image
          src={img}
          alt={title}
          height={500}
          width={500}
          className="h-full w-full object-cover"
        ></Image>
      </div>
      <p className="font-semibold text-xs md:text-base mt-1 md:mt-2">{title}</p>
    </div>
  );
};

export default CategoriesCard;
