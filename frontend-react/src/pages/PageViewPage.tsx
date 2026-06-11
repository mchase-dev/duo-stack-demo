import React from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, ArrowLeft, Edit } from "lucide-react";
import { usePage } from "../hooks/usePages";
import { useAuthStore } from "../store/authStore";
import { Button, Loading } from "../components/ui";

export const PageViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const { data: page, isLoading } = usePage(slug || "");

  const isSuperuser = user?.role?.toLowerCase() === "superuser";

  if (isLoading) {
    return <Loading text="Loading page..." />;
  }

  if (!page) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/pages">
            <Button variant="primary">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Pages
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/pages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </Link>
      </div>

      <article className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {page.title}
              </h1>
              <div className="flex items-center space-x-4 text-blue-100">
                <span>By {page.creator.username}</span>
                <span>•</span>
                <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    page.isPublished
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-gray-900"
                  }`}
                >
                  {page.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
            {isSuperuser && (
              <Link to={`/pages/edit/${page.slug}`}>
                <Button variant="secondary">
                  <Edit className="w-5 h-5 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          <div className="prose prose-lg max-w-none">
            {/* Simple markdown-style rendering */}
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(page.content),
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">
            Last updated: {new Date(page.updatedAt).toLocaleString()}
          </p>
        </div>
      </article>
    </div>
  );
};

// Basic markdown rendering (for production, use a library like react-markdown)
function renderMarkdown(content: string): string {
  return (
    content
      // Process headers FIRST (before converting newlines)
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>'
      )
      // Then process inline formatting
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>'
      )
      // Finally convert remaining newlines to breaks
      .replace(/\n/g, "<br />")
  );
}
