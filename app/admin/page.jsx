import React from "react";
import AdminPanel from "@/components/AdminPanel";
const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <AdminPanel />
      </div>
    </div>
  );
};

export default page;
