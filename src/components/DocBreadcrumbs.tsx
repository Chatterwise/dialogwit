import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface DocBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const DocBreadcrumbs: React.FC<DocBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link
            to="/"
            className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        <li>
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <Link
            to="/documentation"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            Documentation
          </Link>
        </li>

        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              {index === items.length - 1 ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {item.name}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};
