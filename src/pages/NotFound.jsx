import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen text-gray-900 dark:text-white flex flex-col justify-center items-center gap-2">
      <h1 className="text-5xl font-bold">404 Not Found</h1>
      <Link to="/" className=" underline">
        Home
      </Link>
    </div>
  );
};

export default NotFound;
