import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { useEvents, useDeleteEvent } from "../hooks/useEvents";
import { useRealtime } from "../adapters";
import { EventModal } from "../components/calendar/EventModal";
import { Button, Loading } from "../components/ui";
import type { Event, EventVisibility } from "../types";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";

export const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibilityFilter, setVisibilityFilter] = useState<
    EventVisibility | "All"
  >("All");

  const { data: events, isLoading, refetch } = useEvents();
  const deleteMutation = useDeleteEvent();
  const { adapter } = useRealtime();

  // Real-time event updates
  useEffect(() => {
    if (!adapter) return;

    adapter.onEventCreated(() => {
      refetch();
    });

    adapter.onEventUpdated(() => {
      refetch();
    });

    adapter.onEventDeleted(() => {
      refetch();
    });

    return () => {
      // Cleanup listeners handled by adapter
    };
  }, [adapter, refetch]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events?.find((e) => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(eventId);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Filter events by visibility
  const filteredEvents = events?.filter((event) => {
    if (visibilityFilter === "All") return true;
    return event.visibility === visibilityFilter;
  });

  // Convert events to FullCalendar format
  const calendarEvents =
    filteredEvents?.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      backgroundColor: event.color || getVisibilityColor(event.visibility),
      borderColor: event.color || getVisibilityColor(event.visibility),
      extendedProps: {
        description: event.description,
        location: event.location,
        visibility: event.visibility,
      },
    })) || [];

  if (isLoading) {
    return <Loading text="Loading calendar..." />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Event
          </Button>
        </div>

        {/* Visibility Filter */}
        <div className="mt-4 flex space-x-2">
          {(["All", "Private", "Public", "Restricted"] as const).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setVisibilityFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  visibilityFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
                {filter !== "All" && (
                  <span
                    className="ml-2 inline-block w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getVisibilityColor(
                        filter as EventVisibility
                      ),
                    }}
                  />
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-8 bg-gray-50 overflow-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            editable={true}
            height="auto"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
          />
        </div>

        {/* Agenda Sidebar */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {filteredEvents?.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
              >
                <div
                  className="w-1 h-12 rounded-full"
                  style={{
                    backgroundColor:
                      event.color || getVisibilityColor(event.visibility),
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleDateString()} at{" "}
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {(!filteredEvents || filteredEvents.length === 0) && (
              <p className="text-gray-500 text-center py-4">
                No upcoming events
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        initialStart={selectedDate?.start}
        initialEnd={selectedDate?.end}
        onDelete={handleDeleteEvent}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

function getVisibilityColor(visibility: EventVisibility): string {
  switch (visibility) {
    case "Private":
      return "#6B7280"; // gray
    case "Public":
      return "#3B82F6"; // blue
    case "Restricted":
      return "#10B981"; // green
    default:
      return "#3B82F6";
  }
}
