"use client";
import React from "react";
interface NavigationProps {
 children: React.ReactNode

}

const Navigation: React.FC<NavigationProps> = ({ children }) => {

  return (
    <>
      <div className="lg:flex hidden justify-between md:gap-6 lg:gap-2.5 xl:gap-6 2xl:gap-12 items-center mx-auto">
       {children}
      </div>

    </>
  );
};

export default Navigation;
