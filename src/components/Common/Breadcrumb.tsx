import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages }) => {
  return (
    <div className="overflow-hidden shadow-breadcrumb p-5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-0">
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2 m-0">
              {title}
            </h1>

            <ul className="flex items-center gap-2">
              <li className="text-custom-sm hover:text-blue">
                <Link href="/">Home /</Link>
              </li>

              {pages.length > 0 &&
                pages.map((page, key) => (
                  <li className="text-custom-sm last:text-blue capitalize" key={key}>
                    {page}
                  </li>
                ))}
            </ul>
          </div>
        </div>
    </div>
  );
};

export default Breadcrumb;
