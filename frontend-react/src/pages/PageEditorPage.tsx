import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { usePage, useCreatePage, useUpdatePage } from "../hooks/usePages";
import { Button, Input, Loading } from "../components/ui";

const pageSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required"),
  isPublished: z.boolean(),
});

type PageFormData = z.infer<typeof pageSchema>;

export const PageEditorPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);

  const isEditing = pageSlug && pageSlug !== "new";
  const { data: page, isLoading, error } = usePage(isEditing ? pageSlug : "");
  const createMutation = useCreatePage();
  const updateMutation = useUpdatePage();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      content: "",
      isPublished: false,
    },
  });

  const contentValue = watch("content");
  const titleValue = watch("title");

  useEffect(() => {
    if (page) {
      reset({
        title: page.title,
        content: page.content,
        isPublished: page.isPublished,
      });
    }
  }, [page, reset]);

  const onSubmit = (data: PageFormData) => {
    if (isEditing && page) {
      updateMutation.mutate(
        { pageId: page.id, data },
        {
          onSuccess: () => {
            navigate("/pages");
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          navigate("/pages");
        },
      });
    }
  };

  if (isLoading && isEditing) {
    return <Loading text="Loading page..." />;
  }

  if (error && isEditing) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            Error Loading Page
          </h2>
          <p className="text-red-600 mb-6">
            {(error as any)?.response?.data?.error ||
              "Page not found or you do not have permission to edit it."}
          </p>
          <Link to="/pages">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pages
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/pages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-500 to-indigo-600">
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? "Edit Page" : "Create New Page"}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8" autoComplete="off">
          {!isPreview ? (
            <div className="space-y-6">
              <Input
                label="Title"
                placeholder="Page title"
                autoComplete="off"
                error={errors.title?.message}
                {...register("title")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                  <span className="ml-2 text-xs text-gray-500">
                    (Supports basic markdown: **bold**, *italic*, `code`, #
                    heading)
                  </span>
                </label>
                <textarea
                  {...register("content")}
                  rows={20}
                  placeholder="Write your content here...&#10;&#10;# Heading 1&#10;## Heading 2&#10;&#10;**Bold text** and *italic text*&#10;&#10;`inline code`"
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register("isPublished")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isPublished"
                  className="text-sm font-medium text-gray-700"
                >
                  Publish this page
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/pages")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Update Page" : "Create Page"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <h1>{titleValue || "Untitled Page"}</h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(contentValue || "No content yet..."),
                }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Basic markdown rendering
function renderMarkdown(content: string): string {
  return content
    .replace(/\n/g, "<br />")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>'
    )
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>')
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>'
    );
}
