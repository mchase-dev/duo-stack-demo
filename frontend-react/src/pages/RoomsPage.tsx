import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Hash, Users, Plus, Trash, Send } from "lucide-react";
import { useRooms, useCreateRoom, useDeleteRoom } from "../hooks/useRooms";
import { useRealtime } from "../adapters";
import { useAuthStore } from "../store/authStore";
import { Button, Input, Loading } from "../components/ui";
import type { Room } from "../types";

interface RoomMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

interface OnlineUser {
  userId: string;
  username: string;
}

export const RoomsPage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useAuthStore();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const createRoomMutation = useCreateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const { adapter } = useRealtime();

  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin" ||
    currentUser?.role?.toLowerCase() === "superuser";

  // Join room when selected
  useEffect(() => {
    if (!adapter || !selectedRoom || !currentUser) return;

    adapter.joinRoom(selectedRoom.id);
    setRoomMessages([]); // Clear messages when switching rooms
    setOnlineUsers([]); // Clear online users, will be populated by roomMembers event

    return () => {
      if (adapter && selectedRoom) {
        adapter.leaveRoom(selectedRoom.id);
      }
    };
  }, [adapter, selectedRoom, currentUser]);

  // Real-time room message updates
  useEffect(() => {
    if (!adapter) return;

    // Handle initial room members list when joining
    adapter.on(
      "roomMembers",
      (event: { roomId: string; members: OnlineUser[] }) => {
        if (selectedRoom && event.roomId === selectedRoom.id) {
          // Add existing members to the list
          setOnlineUsers((prev) => {
            const newMembers = event.members.filter(
              (member) => !prev.some((u) => u.userId === member.userId)
            );
            return [...prev, ...newMembers];
          });

          // Add current user if not already in the list
          if (
            currentUser &&
            !event.members.some((m) => m.userId === currentUser.id)
          ) {
            setOnlineUsers((prev) => {
              if (prev.some((u) => u.userId === currentUser.id)) {
                return prev;
              }
              return [
                ...prev,
                { userId: currentUser.id, username: currentUser.username },
              ];
            });
          }
        }
      }
    );

    adapter.onRoomMessage((event) => {
      if (selectedRoom && event.roomId === selectedRoom.id) {
        setRoomMessages((prev) => [
          ...prev,
          {
            id: event.messageId,
            roomId: event.roomId,
            senderId: event.senderId,
            senderUsername: event.senderUsername,
            message: event.message,
            timestamp: event.timestamp,
          },
        ]);
      }
    });

    adapter.onUserJoinedRoom((event) => {
      if (selectedRoom && event.roomId === selectedRoom.id) {
        setOnlineUsers((prev) => {
          // Prevent duplicates
          if (prev.some((u) => u.userId === event.userId)) {
            return prev;
          }
          return [...prev, { userId: event.userId, username: event.username }];
        });
      }
    });

    adapter.onUserLeftRoom((event) => {
      if (selectedRoom && event.roomId === selectedRoom.id) {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== event.userId));
      }
    });

    return () => {
      // Cleanup handled by adapter
    };
  }, [adapter, selectedRoom, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom || !adapter) return;

    // Store message and clear input immediately (optimistic update)
    const message = messageInput;
    setMessageInput("");

    try {
      await adapter.sendToRoom(selectedRoom.id, message);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally restore message on error
      setMessageInput(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    createRoomMutation.mutate(
      {
        name: newRoomName,
        description: newRoomDescription || undefined,
        isPublic: true,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setNewRoomName("");
          setNewRoomDescription("");
        },
      }
    );
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      deleteRoomMutation.mutate(roomId, {
        onSuccess: () => {
          if (selectedRoom?.id === roomId) {
            setSelectedRoom(null);
          }
        },
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* Rooms List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Chat Rooms</h2>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <Loading size="sm" />
          ) : rooms && rooms.length > 0 ? (
            <div className="divide-y">
              {rooms.map((room: Room) => (
                <div
                  key={room.id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                    selectedRoom?.id === room.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Hash className="w-5 h-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {room.name}
                        </h3>
                        {room.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {room.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.id);
                        }}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No rooms available</p>
              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Room Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Hash className="w-6 h-6 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedRoom.name}
                    </h3>
                    {selectedRoom.description && (
                      <p className="text-sm text-gray-500">
                        {selectedRoom.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Online Users Indicator */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{onlineUsers.length} online</span>
                  {onlineUsers.length > 0 && (
                    <div className="ml-2 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Online Users List (expandable) */}
              {onlineUsers.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <details className="cursor-pointer">
                    <summary className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Online Users ({onlineUsers.length})
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {onlineUsers.map((user) => (
                        <div
                          key={user.userId}
                          className="flex items-center space-x-1 bg-green-50 text-green-800 px-2 py-1 rounded-full text-xs"
                        >
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>{user.username}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {roomMessages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md ${
                          isOwnMessage ? "" : "flex items-start space-x-2"
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-700">
                              {message.senderUsername[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          {!isOwnMessage && (
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              {message.senderUsername}
                            </p>
                          )}
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-900 shadow"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message #${selectedRoom.name}`}
                  autoComplete="off"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Room
            </h2>
            <div className="space-y-4">
              <Input
                label="Room Name"
                placeholder="general"
                autoComplete="off"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  rows={3}
                  placeholder="Room description (optional)"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateRoom}
                isLoading={createRoomMutation.isPending}
                disabled={!newRoomName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
