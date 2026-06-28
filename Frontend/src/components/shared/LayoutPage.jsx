import React from "react";
import { Outlet } from "react-router";

function LayoutPage() {
  return (
    <div className="max-w-screen w-screen min-h-screen bg-amber-400">
      <div className="flex">
        <div></div>
        <div className="w-full">
          <div className="">
            <p>Production Dashborad</p>
            <p>Overviwe result</p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LayoutPage;
