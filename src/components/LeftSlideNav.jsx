import React, { useState, useEffect, useCallback } from 'react';
import { Moon,Sun } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

export default function LeftSlideNav() {
  const stateChats = useSelector(state=>state.Chats)
  const [CurrentChatID,setCurrentChatID] = useState(useSelector(state=>state.CurrentChat))
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [isLightTheme, setIsLightTheme] = useState(true); 

  const [chats, setChats] = useState(stateChats);

  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Save width in localStorage for persistence
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) {
        setWidth(parseInt(savedWidth, 10));
      }

      const savedTheme = localStorage.getItem('sidebarTheme');
      if (savedTheme) {
        setIsLightTheme(savedTheme === 'light');
      }
    } catch (e) {
      console.error('Could not load sidebar width from localStorage', e);
    }
  }, []);
  const toggleTheme = () => {
    setIsLightTheme(prevTheme => !prevTheme);
  };
  // Save width and theme when they change
  useEffect(() => {
    if (!isDragging && width !== 280) {
      try {
        localStorage.setItem('sidebarWidth', width.toString());
      } catch (e) {
        console.error('Could not save sidebar width to localStorage', e);
      }
    }

    try {
      localStorage.setItem('sidebarTheme', isLightTheme ? 'light' : 'dark');
    } catch (e) {
      console.error('Could not save sidebar theme to localStorage', e);
    }
  }, [width, isDragging, isLightTheme]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger-button');

      if (isOpen &&
          sidebar &&
          !sidebar.contains(event.target) &&
          hamburger &&
          !hamburger.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const startDragging = (clientX) => {
    setStartX(clientX);
    setStartWidth(width);
    setIsDragging(true);
    document.body.classList.add('resize-cursor');
  };

  const handleDrag = useCallback((clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    const newWidth = Math.max(200, Math.min(480, startWidth + deltaX));
    setWidth(newWidth);
  }, [isDragging, startX, startWidth]);

  const endDragging = () => {
    setIsDragging(false);
    document.body.classList.remove('resize-cursor');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      requestAnimationFrame(() => handleDrag(e.clientX));
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        requestAnimationFrame(() => handleDrag(e.touches[0].clientX));
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', endDragging);
      document.addEventListener('touchend', endDragging);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', endDragging);
      document.removeEventListener('touchend', endDragging);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDrag]);

  const handleChatSelect = (id) => {
    setCurrentChatID(id)
  };

  const createNewChat = () => {
    const newId = Math.max(...chats.map(chat => chat.id), 0) + 1;
    const newChat = {
      id: nanoid(),
      title: `New Chat ${newId}`,
      active: true,
      date:Date.now()
    };
    setChats([
      newChat,
      ...chats.map(chat => ({...chat, active: false}))
    ]);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const startEditingChat = (id, e) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === id);
    setEditingChatId(id);
    setEditingTitle(chat.title);
  };

  const saveEditedChat = () => {
    if (editingTitle.trim() === '') return;
    setChats(chats.map(chat =>
      chat.id === editingChatId
        ? { ...chat, title: editingTitle }
        : chat
    ));
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditedChat();
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  const startDeletingChat = (id, e) => {
    e.stopPropagation();
    setDeletingChatId(id);
  };

  const confirmDeleteChat = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      const newChats = chats.filter(chat => chat.id !== deletingChatId);
      if (chats.find(chat => chat.id === deletingChatId)?.active && newChats.length > 0) {
        newChats[0].active = true;
      }
      setChats(newChats);
      setDeletingChatId(null);
      setIsDeleting(false);
    }, 800);
  };

  const cancelDeleteChat = (e) => {
    e.stopPropagation();
    setDeletingChatId(null);
  };

  const ChatHistory = ({
    chat,
    isEditing,
    editingTitle,
    setEditingTitle,
    handleKeyDown,
    saveEditedChat,
    isDeleting,
    isLoadingDelete,
    onClick,
    onEditClick,
    onDeleteClick,
    onConfirmDelete,
    onCancelDelete
  }) => {
    const { title, id } = chat;

    if (isLoadingDelete) {
      return (
        <div className={`bg-red-900/20 border-red-500/30 transition-all duration-200 p-3 rounded-lg border backdrop-blur-md ${isLightTheme ? 'text-black' : 'text-red-300'}`}>
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Deleting chat...</span>
          </div>
        </div>
      );
    }

    if (isDeleting) {
      return (
        <div className={`bg-red-900/20 border-red-500/30 transition-all duration-200 p-3 rounded-lg border backdrop-blur-md ${isLightTheme ? 'text-black' : 'text-white'}`}>
          <div className="text-center text-sm mb-2">Delete this chat?</div>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={onConfirmDelete}
              className="bg-red-600/50 hover:bg-red-700/50 text-white px-3 py-1 rounded text-xs"
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              className="bg-gray-600/50 hover:bg-gray-700/50 text-white px-3 py-1 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className={`bg-purple-900/20 border-purple-500/30 transition-all duration-200 p-3 rounded-lg border backdrop-blur-md ${isLightTheme ? 'text-black' : 'text-white'}`}>
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveEditedChat}
            autoFocus
            className={`w-full bg-black/60  border border-purple-500/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isLightTheme ? 'bg-white text-black border-gray-300' : ''}`}
          />
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        className={`${
          id==CurrentChatID
            ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 shadow-lg shadow-purple-500/10'
            : 'bg-black/40 border-purple-500/10 hover:bg-purple-900/20'
        } group transition-all duration-200 p-3 rounded-lg cursor-pointer border backdrop-blur-md ${isLightTheme ? 'bg-white text-black border-gray-300' : ''}`}
      >
        <div className='flex items-center space-x-3'>
          <div className={`${
            id==CurrentChatID ? 'text-purple-300' : 'text-gray-400'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <h3 className={`${
            id==CurrentChatID ? 'text-white' : 'text-gray-300'
          } text-sm truncate flex-1 ${isLightTheme ? 'text-black' : ''}`}>{title}</h3>
          <div className={`flex space-x-1 ${id == CurrentChatID ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}>
            <button
              onClick={onEditClick}
              className="text-gray-400 hover:text-purple-300 p-1 rounded-full hover:bg-purple-900/30"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            <button
              onClick={onDeleteClick}
              className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-red-900/30"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div id="hamburger-button" className='md:hidden fixed top-0 left-0 p-4 z-50 flex items-center'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-black/80 backdrop-blur-lg p-2 rounded-lg border text-white hover:bg-white/5 transition-colors ${isLightTheme ? 'bg-white text-black border-gray-300' : ''}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        id="sidebar"
        style={{
          width: `${width}px`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
        }}
        className={`fixed md:relative top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${isLightTheme ? 'bg-white text-black border-gray-300' : 'bg-black border-purple-500/20'}
        flex flex-col`}
      >
        <div
          className={`absolute top-0 right-0 w-1 h-full ${isLightTheme ? 'bg-gray-300/20 hover:bg-gray-300/40' : 'bg-purple-500/20 hover:bg-purple-500/40'} group
                      ${isDragging ? 'bg-purple-500/60' : ''}`}
          style={{
            cursor: 'ew-resize',
            transform: 'translateX(1px)',
            transition: isDragging ? 'none' : 'background-color 0.2s'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDragging(e.clientX);
          }}
          onTouchStart={(e) => {
            if (e.touches && e.touches[0]) {
              e.preventDefault();
              startDragging(e.touches[0].clientX);
            }
          }}
        >
          <div className="absolute top-1/2 right-0 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className={`bg-purple-500/30 backdrop-blur-md p-1 rounded shadow-lg border ${isLightTheme ? 'border-gray-300' : 'border-purple-500/30'}`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`flex flex-col h-full ${isLightTheme ? 'bg-white' : 'bg-gradient-to-b from-black to-purple-950/10'}`}>
          <div className={`border-b ${isLightTheme ? 'border-gray-300' : 'border-purple-500/20'} p-4 pt-6 md:pt-4`}>
            <div className='flex justify-around items-center space-x-3'>
              <div className={`h-10 w-10 rounded-full ${isLightTheme ? 'bg-gradient-to-br from-blue-400 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-blue-800'} flex items-center justify-center border shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 110-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className={`text-lg font-medium ${isLightTheme ? 'text-black' : 'text-white'}`}>OllamaChatUI</h1>
              <button
                    onClick={toggleTheme}
                    className={` ${isLightTheme ? "text-black hover:bg-purple-500":"text-white hover:bg-purple-800"} p-2 hover:bg-purple-800/30 rounded-full transition-colors`}
                    title="Toggle theme"
                  >
                    {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
                  </button>
            </div>
          </div>

          <div className='p-3'>
            <button
              onClick={createNewChat}
              className={`w-full ${isLightTheme ? 'bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300' : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 hover:from-blue-700/40 hover:to-purple-700/40'}
                      text-white py-2 px-4 rounded-lg border backdrop-blur-lg
                      transition-all duration-200 flex items-center justify-center space-x-2
                      shadow-lg group`}
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          <div className='flex-1 overflow-y-auto px-3 py-2'>
            <div className='flex items-center justify-between mb-3 px-1'>
              <h2 className={`font-medium text-sm ${isLightTheme ? 'text-black' : 'text-white/80'}`}>Recent Chats</h2>
              <div className='flex items-center space-x-2'>
                <div className={`text-xs ${isLightTheme ? 'text-black/50' : 'text-white/50'}`}>{width}px</div>
                <div className={`h-5 w-5 flex items-center justify-center rounded-full ${isLightTheme ? 'bg-gray-300/30 text-black/70 border-gray-300' : 'bg-purple-900/30 text-white/70 border-purple-500/20'}`}>
                  {chats.length}
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              {chats.map(chat => (
                <ChatHistory
                  key={chat.id}
                  chat={chat}
                  isEditing={editingChatId === chat.id}
                  editingTitle={editingTitle}
                  setEditingTitle={setEditingTitle}
                  handleKeyDown={handleKeyDown}
                  saveEditedChat={saveEditedChat}
                  isDeleting={deletingChatId === chat.id}
                  isLoadingDelete={isDeleting && deletingChatId === chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  onEditClick={(e) => startEditingChat(chat.id, e)}
                  onDeleteClick={(e) => startDeletingChat(chat.id, e)}
                  onConfirmDelete={confirmDeleteChat}
                  onCancelDelete={cancelDeleteChat}
                />
              ))}
            </div>
          </div>

          <div className={`mt-auto border-t ${isLightTheme ? 'border-gray-300' : 'border-purple-500/20'} p-3`}>
            <div className={`rounded-lg p-2 flex items-center space-x-3 cursor-pointer ${isLightTheme ? 'bg-gray-100 hover:bg-gray-200' : 'bg-black/40 hover:bg-purple-900/20'} transition-colors border`}>
              <div className={`h-10 w-10 rounded-full ${isLightTheme ? 'bg-gradient-to-br from-blue-400 to-purple-600' : 'bg-gradient-to-br from-blue-900/50 to-purple-900/50'} flex items-center justify-center text-white`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className='flex-1'>
                <h3 className={`text-sm font-medium ${isLightTheme ? 'text-black' : 'text-white'}`}>John Doe</h3>
                <p className={`text-xs ${isLightTheme ? 'text-gray-600' : 'text-purple-300/60'}`}>Premium Account</p>
              </div>
              <div className={`text-white/60 hover:text-purple-300 ${isLightTheme ? 'text-black/60 hover:text-black' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
