import { UserOnboarding } from "@/components/Form/UserOnboarding";
import React from "react";

const page = () => {
  return (
    <div className="info-container ">
      <div className="w-full bg-transparent flex items-center justify-center p-4">
        <UserOnboarding />
      </div>
    </div>
  );
};

export default page;
