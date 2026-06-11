import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Lock, Globe, Users, Save, Trash } from "lucide-react";
import { useCreateEvent, useUpdateEvent } from "../../hooks/useEvents";
import { Button, Input, UserMultiSelect } from "../ui";
import type { Event, EventVisibility } from "../../types";

const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    startTime: z.string().min(1, "Start date is required"),
    endTime: z.string().min(1, "End date is required"),
    visibility: z.enum(["Private", "Public", "Restricted"]),
    color: z.string().optional(),
    location: z
      .string()
      .max(200, "Location must be less than 200 characters")
      .optional(),
    allowedUserIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Ensure end date is after start date
      const startDate = new Date(data.startTime);
      const endDate = new Date(data.endTime);
      return endDate > startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endTime"], // Show error on the endTime field
    }
  );

type EventFormData = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  initialStart?: string;
  initialEnd?: string;
  onDelete?: (eventId: string) => void;
  isDeleting?: boolean;
}

const visibilityOptions: {
  value: EventVisibility;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "Private", label: "Private", icon: <Lock className="w-4 h-4" /> },
  { value: "Public", label: "Public", icon: <Globe className="w-4 h-4" /> },
  {
    value: "Restricted",
    label: "Restricted",
    icon: <Users className="w-4 h-4" />,
  },
];

const colorPresets = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
];

// Format date string for datetime-local input (YYYY-MM-DDTHH:mm)
const formatDateTimeLocal = (dateString: string): string => {
  // Check if it's a date-only string (YYYY-MM-DD) from FullCalendar all-day selection
  // If so, treat it as local midnight, not UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Parse manually to avoid UTC interpretation
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}T00:00`;
  }

  // For datetime strings, parse normally (will use local timezone)
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialStart,
  initialEnd,
  onDelete,
  isDeleting = false,
}) => {
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: initialStart || "",
      endTime: initialEnd || "",
      visibility: "Public",
      color: colorPresets[0],
      location: "",
      allowedUserIds: [],
    },
  });

  const visibility = watch("visibility");

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || "",
        startTime: formatDateTimeLocal(event.startTime),
        endTime: formatDateTimeLocal(event.endTime),
        visibility: event.visibility,
        color: event.color || colorPresets[0],
        location: event.location || "",
        allowedUserIds: event.allowedUserIds || [],
      });
    } else if (initialStart && initialEnd) {
      reset({
        title: "",
        description: "",
        startTime: formatDateTimeLocal(initialStart),
        endTime: formatDateTimeLocal(initialEnd),
        visibility: "Public",
        color: colorPresets[0],
        location: "",
        allowedUserIds: [],
      });
    }
  }, [event, initialStart, initialEnd, reset]);

  const onSubmit = (data: EventFormData) => {
    // Convert datetime-local strings (local time) to ISO strings (UTC)
    const startDateTime = new Date(data.startTime);
    const endDateTime = new Date(data.endTime);

    const requestData = {
      ...data,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    if (isEditing) {
      updateMutation.mutate(
        { eventId: event.id, data: requestData },
        {
          onSuccess: () => {
            onClose();
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(requestData, {
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6" autoComplete="off">
          <Input
            label="Title"
            placeholder="Event title"
            autoComplete="off"
            error={errors.title?.message}
            {...register("title")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Event description (optional)"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              autoComplete="off"
              error={errors.startTime?.message}
              {...register("startTime")}
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              autoComplete="off"
              error={errors.endTime?.message}
              {...register("endTime")}
            />
          </div>

          <Input
            label="Location"
            placeholder="Event location (optional)"
            autoComplete="off"
            error={errors.location?.message}
            {...register("location")}
          />

          {/* Visibility Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition ${
                        field.value === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.visibility && (
              <p className="mt-1 text-sm text-red-600">
                {errors.visibility.message}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex space-x-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`w-10 h-10 rounded-full transition ${
                        field.value === color
                          ? "ring-4 ring-offset-2 ring-blue-500"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* Restricted Users (shown only when visibility is Restricted) */}
          {visibility === "Restricted" && (
            <Controller
              name="allowedUserIds"
              control={control}
              render={({ field }) => (
                <UserMultiSelect
                  label="Allowed Users"
                  selectedUserIds={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            {/* Delete button on the left (only shown when editing) */}
            {isEditing && onDelete && event && (
              <Button
                type="button"
                variant="danger"
                onClick={() => onDelete(event.id)}
                isLoading={isDeleting}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            )}
            {/* Spacer when no delete button */}
            {(!isEditing || !onDelete) && <div />}

            {/* Cancel and Save buttons on the right */}
            <div className="flex space-x-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
