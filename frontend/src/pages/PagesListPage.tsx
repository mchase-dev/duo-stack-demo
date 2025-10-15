import React from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Eye, Edit, Trash } from "lucide-react";
import { usePages, useDeletePage } from "../hooks/usePages";
import { useAuthStore } from "../store/authStore";
import { Button, Loading } from "../components/ui";

export const PagesListPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: pages, isLoading } = usePages();
  const deleteMutation = useDeletePage();

  const isSuperuser = user?.role?.toLowerCase() === "superuser";

  const handleDelete = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(pageId);
    }
  };

  if (isLoading) {
    return <Loading text="Loading pages..." />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
        </div>
        {isSuperuser && (
          <Link to="/pages/new">
            <Button variant="primary">
              <Plus className="w-5 h-5 mr-2" />
              New Page
            </Button>
          </Link>
        )}
      </div>

      {pages && pages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">
                    {page.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      page.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {page.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  By {page.creator.username} •{" "}
                  {new Date(page.createdAt).toLocaleDateString()}
                </p>

                <div className="flex items-center space-x-2">
                  <Link to={`/pages/${page.slug}`}>
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>

                  {isSuperuser && (
                    <>
                      <Link to={`/pages/edit/${page.slug}`}>
                        <Button variant="secondary" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        isLoading={deleteMutation.isPending}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No pages yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first page to get started
          </p>
          {isSuperuser && (
            <Link to="/pages/new">
              <Button variant="primary">
                <Plus className="w-5 h-5 mr-2" />
                Create Page
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
