import React from "react";
import { Triangle } from "react-loader-spinner";

const TraingleLoader = () => {
  return (
    <div
      className="
     h-[calc(100vh-100px)] w-full 
        flex items-center justify-center
    "
    >
      <Triangle
        visible={true}
        height="80"
        width="80"
        color="#4B35EA"
        ariaLabel="triangle-loading"
        wrapperClass=""
      />
    </div>
  );
};

export default TraingleLoader;
