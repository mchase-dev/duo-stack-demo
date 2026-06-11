import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User, Plus, X } from "lucide-react";
import {
  useConversations,
  useConversation,
  useSendMessage,
} from "../hooks/useMessages";
import { useUsers } from "../hooks/useUsers";
import { useRealtime } from "../adapters";
import { useAuthStore } from "../store/authStore";
import { Button, Loading } from "../components/ui";
import { User as UserType } from "../types";

export const MessagesPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState<string | null>(
    null
  );
  const [newMessageContent, setNewMessageContent] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useAuthStore();
  const {
    data: conversations,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useConversations();
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useConversation(selectedUserId || "");
  const { data: allUsers, isLoading: usersLoading } = useUsers();
  const sendMessageMutation = useSendMessage();
  const { adapter } = useRealtime();

  // Real-time message updates
  useEffect(() => {
    if (!adapter) return;

    adapter.onUserMessage((event) => {
      // Refetch conversations and messages when new message arrives
      refetchConversations();
      // Check if message is related to current conversation
      if (
        selectedUserId === event.senderId ||
        selectedUserId === event.receiverId
      ) {
        refetchMessages();
      }
    });

    return () => {
      // Cleanup handled by adapter
    };
  }, [adapter, selectedUserId, refetchConversations, refetchMessages]);

  // Track online/offline status
  useEffect(() => {
    if (!adapter) return;

    // Check if presence tracking methods exist (for backward compatibility)
    if (typeof adapter.onUserOnline === "function") {
      adapter.onUserOnline((event) => {
        setOnlineUserIds((prev) => new Set(prev).add(event.userId));
      });
    }

    if (typeof adapter.onUserOffline === "function") {
      adapter.onUserOffline((event) => {
        setOnlineUserIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(event.userId);
          return newSet;
        });
      });
    }

    return () => {
      // Cleanup handled by adapter
    };
  }, [adapter]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedUserId) return;

    sendMessageMutation.mutate(
      {
        toUserId: selectedUserId,
        content: messageInput,
      },
      {
        onSuccess: () => {
          setMessageInput("");
          refetchMessages();
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectRecipient = (userId: string) => {
    setNewMessageRecipient(userId);
  };

  const handleSendNewMessage = () => {
    if (!newMessageContent.trim() || !newMessageRecipient) return;

    sendMessageMutation.mutate(
      {
        toUserId: newMessageRecipient,
        content: newMessageContent,
      },
      {
        onSuccess: () => {
          setNewMessageContent("");
          setNewMessageRecipient(null);
          setIsNewMessageModalOpen(false);
          setSelectedUserId(newMessageRecipient);
          refetchConversations();
          refetchMessages();
        },
      }
    );
  };

  const handleCloseNewMessageModal = () => {
    setIsNewMessageModalOpen(false);
    setNewMessageRecipient(null);
    setNewMessageContent("");
  };

  const selectedConversation = conversations?.find(
    (c) => c.user.id === selectedUserId
  );

  // Filter out current user and users already in conversations
  // allUsers is a paginated response with 'items' property
  const usersList = (allUsers as any)?.items || [];
  const availableUsers = usersList.filter(
    (u: any) =>
      u.id !== currentUser?.id &&
      !conversations?.some((c) => c.user.id === u.id)
  );

  const selectedRecipient = usersList.find(
    (u: any) => u.id === newMessageRecipient
  );

  return (
    <div className="h-screen flex">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            </div>
            <button
              onClick={() => setIsNewMessageModalOpen(true)}
              className="text-blue-600 hover:text-blue-700"
              title="New Message"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <Loading size="sm" />
          ) : conversations && conversations.length > 0 ? (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.user.id}
                  onClick={() => setSelectedUserId(conversation.user.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                    selectedUserId === conversation.user.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {conversation.user.avatarUrl ? (
                        <img
                          src={conversation.user.avatarUrl}
                          alt={conversation.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.user.username}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          conversation.lastMessage.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedUserId && selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {selectedConversation.user.avatarUrl ? (
                    <img
                      src={selectedConversation.user.avatarUrl}
                      alt={selectedConversation.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.user.username}
                  </h3>
                  <p
                    className={`text-sm ${
                      onlineUserIds.has(selectedConversation.user.id)
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {onlineUserIds.has(selectedConversation.user.id)
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messagesLoading ? (
                <Loading text="Loading messages..." />
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.fromUserId === currentUser?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-900 shadow"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  autoComplete="off"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  isLoading={sendMessageMutation.isPending}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">New Message</h2>
              <button
                onClick={handleCloseNewMessageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!newMessageRecipient ? (
              <div className="flex-1 overflow-y-auto p-6">
                {usersLoading ? (
                  <Loading text="Loading users..." />
                ) : availableUsers.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Select a user to message:
                    </p>
                    <div className="space-y-2">
                      {availableUsers.map((user: UserType) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectRecipient(user.id)}
                          className="w-full p-4 text-left hover:bg-gray-50 rounded-lg transition flex items-center space-x-3 border border-transparent hover:border-blue-200"
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No users available to message</p>
                    {conversations && conversations.length > 0 && (
                      <p className="text-sm mt-2">
                        You already have conversations with all users
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Selected Recipient */}
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {selectedRecipient?.avatarUrl ? (
                        <img
                          src={selectedRecipient.avatarUrl}
                          alt={selectedRecipient.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To:</p>
                      <h3 className="font-medium text-gray-900">
                        {selectedRecipient?.username}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewMessageRecipient(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>

                {/* Message Input */}
                <div className="flex-1 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    autoFocus
                  />
                </div>

                {/* Send Button */}
                <div className="p-6 border-t flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setNewMessageRecipient(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendNewMessage}
                    disabled={!newMessageContent.trim()}
                    isLoading={sendMessageMutation.isPending}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
