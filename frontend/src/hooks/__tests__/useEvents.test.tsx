/**
 * useEvents Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../useEvents";
import { eventsApi } from "../../api/events";
import type { Event } from "../../types";

// Mock the API
vi.mock("../../api/events", () => ({
  eventsApi: {
    getEvents: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockEvent: Event = {
  id: "event-1",
  title: "Test Event",
  description: "Test description",
  startTime: "2024-01-15T10:00:00.000Z",
  endTime: "2024-01-15T11:00:00.000Z",
  visibility: "Public",
  color: "#3B82F6",
  location: "Test Location",
  createdBy: "user-1",
  creatorUsername: "testuser",
  allowedUserIds: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("useEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch events successfully", async () => {
    const mockEvents = [mockEvent];
    vi.mocked(eventsApi.getEvents).mockResolvedValue({
      success: true,
      data: mockEvents,
    });

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvents);
    expect(eventsApi.getEvents).toHaveBeenCalled();
  });

  it("should handle fetch errors", async () => {
    const error = new Error("Failed to fetch events");
    vi.mocked(eventsApi.getEvents).mockRejectedValue(error);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});

describe("useCreateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an event successfully", async () => {
    vi.mocked(eventsApi.createEvent).mockResolvedValue({
      success: true,
      data: mockEvent,
    });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "New Event",
      startTime: "2024-01-15T10:00:00.000Z",
      endTime: "2024-01-15T11:00:00.000Z",
      visibility: "Public",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eventsApi.createEvent).toHaveBeenCalled();
  });
});

describe("useUpdateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update an event successfully", async () => {
    const updatedEvent = { ...mockEvent, title: "Updated Event" };
    vi.mocked(eventsApi.updateEvent).mockResolvedValue({
      success: true,
      data: updatedEvent,
    });

    const { result } = renderHook(() => useUpdateEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      eventId: "event-1",
      data: { title: "Updated Event" },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eventsApi.updateEvent).toHaveBeenCalledWith("event-1", {
      title: "Updated Event",
    });
  });
});

describe("useDeleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete an event successfully", async () => {
    vi.mocked(eventsApi.deleteEvent).mockResolvedValue({
      success: true,
      data: { message: "Event deleted successfully" },
    });

    const { result } = renderHook(() => useDeleteEvent(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("event-1");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(eventsApi.deleteEvent).toHaveBeenCalledWith("event-1");
  });
});
