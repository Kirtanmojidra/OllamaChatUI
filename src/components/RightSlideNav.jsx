import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import { Save, GripVertical, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useSelector,useDispatch} from 'react-redux';
import { UpdateSettings } from '../features/ChatFeature';
export default function RightSlideNav() {
  const dispatch = useDispatch()
  const Initialsettings = useSelector(state => state.Settings)
  const [settings, setSettings] = useState(Initialsettings);
  const [isSaved, setIsSaved] = useState(false);
  const [width, setWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(true); // State for theme management
  const dragHandleRef = useRef(null);
  const sideNavRef = useRef(null);


  const [baseUrl,setBaseUrl] = useState(settings.BaseUrl.url)
  const [sysPrompt,setSysPrompt] = useState(settings.systemPrompt.content)
  const [num_ctx,setNum_ctx] = useState(settings.num_ctx.default)
  const [temperature,setTemperature] = useState(settings.temperature.default)
  const [topP,SetTopP] = useState(settings.topP.default)
  const [fPenalty,setFPenalty] = useState(settings.frequencyPenalty.default)
  const [pPenalty,setPPenalty] = useState(settings.presencePenalty.default)
  const [maxTokens,setMaxTokens] = useState(settings.maxTokens.default)
  const [model,setModel] = useState(settings.Model.selected)
  
  // Check if device is mobile with debounce
  useEffect(() => {
    let resizeTimer;

    const checkIfMobile = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const isMobileView = window.innerWidth <= 768;
        setIsMobile(isMobileView);
        if (isMobileView) {
          setIsCollapsed(true);
        }
      }, 100);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Load settings from localStorage when component mounts
  useEffect(() => {
    const savedWidth = localStorage.getItem('ollamaSettingsWidth');
    if (savedWidth) {
      setWidth(parseInt(savedWidth));
    }

    const savedTheme = localStorage.getItem('ollamaTheme');
    if (savedTheme) {
      setIsLightTheme(savedTheme === 'light');
    }
  }, []);

  const handleChange = (e) => {
    if(e.target.name == "num_ctx"){
        setNum_ctx(e.target.value)
        dispatch(UpdateSettings({"name":"num_ctx","value":e.target.value}))
    }else if(e.target.name == "temperature"){
      setTemperature(e.target.value)
      dispatch(UpdateSettings({"name":"temperature","value":e.target.value}))

    }else if(e.target.name == "topP"){
      SetTopP(e.target.value)
      dispatch(UpdateSettings({"name":"topP","value":e.target.value}))
    }else if(e.target.name == "frequencyPenalty"){
      setFPenalty(e.target.value)
      dispatch(UpdateSettings({"name":"frequencyPenalty","value":e.target.value}))
    }else if(e.target.name == "presencePenalty"){
      setPPenalty(e.target.value)
      dispatch(UpdateSettings({"name":"presencePenalty","value":e.target.value}))
    }else if(e.target.name == "maxTokens"){
      setMaxTokens(e.target.value)
      dispatch(UpdateSettings({"name":"maxTokens","value":e.target.value}))
    }else if(e.target.name == "baseUrl"){
      setBaseUrl(e.target.value)
      dispatch(UpdateSettings({"name":"baseUrl","value":e.target.value}))
    }else if(e.target.name == "systemPrompt"){
      setSysPrompt(e.target.value)
      dispatch(UpdateSettings({"name":"systemPrompt","value":e.target.value}))
    }else if(e.target.name == "model"){
      setModel(e.target.value)
      dispatch(UpdateSettings({"name":"model","value":e.target.value}))
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('ollamaSettings', JSON.stringify(settings));
      localStorage.setItem('ollamaSettingsWidth', width.toString());
      localStorage.setItem('ollamaTheme', isLightTheme ? 'light' : 'dark');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const initialX = e.clientX;
    const initialWidth = width;

    let animationFrameId = null;
    let currentWidth = initialWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = initialWidth - (initialX - moveEvent.clientX);
      if (newWidth >= 250 && newWidth <= 600) {
        currentWidth = newWidth;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(() => {
          setWidth(currentWidth);
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      localStorage.setItem('ollamaSettingsWidth', currentWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleTheme = () => {
    setIsLightTheme(prevTheme => !prevTheme);
  };

  useEffect(() => {
    if (sideNavRef.current) {
      sideNavRef.current.style.setProperty('--panel-width', `${width}px`);
    }
  }, [width]);

  const themeClasses = isLightTheme ?
    'bg-white text-black border-gray-300' :
    'bg-black text-white border-purple-500/20';

  return (
    <div className="relative h-screen flex">
      <button
        onClick={toggleSidebar}
        className={`z-50 fixed right-0 top-1/2 -translate-y-1/2 z-20 ${themeClasses} py-4 px-2 border shadow-lg transform hover:scale-105 active:scale-95 transition-all rounded-l-full`}
      >
        {isCollapsed ? <ChevronLeft size={20} className="text-purple-500" /> : <ChevronRight size={20} className="text-purple-500" />}
      </button>

      <div
        ref={sideNavRef}
        className={`h-screen relative flex flex-col ${themeClasses} transition-all duration-300 ease-in-out transform ${isMobile ? 'fixed right-0 z-10' : 'relative'}`}
        style={{
          width: isCollapsed ? (isMobile ? '0' : '60px') : (isMobile ? '100vw' : `${width}px`),
          opacity: isCollapsed && isMobile ? 0 : 1,
          pointerEvents: isCollapsed && isMobile ? 'none' : 'auto',
          boxShadow: isCollapsed ? 'none' : 'rgba(138, 75, 175, 0.2) -5px 0 15px'
        }}
      >
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black opacity-80"></div>
        <div className="absolute inset-0 backdrop-blur-xl bg-black/30"></div>
        <div className="absolute inset-0 border-r border-purple-500/20"></div>

        {!isMobile && !isCollapsed && (
          <div
            ref={dragHandleRef}
            className={`absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-purple-500 z-10 transition-colors ${isDragging ? 'bg-purple-500' : 'bg-purple-700/40'}`}
            onMouseDown={handleDragStart}
            onTouchStart={(e) => e.preventDefault()}
          >
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-black border border-purple-500/30 rounded-full p-1.5 cursor-ew-resize ${isDragging ? 'opacity-100 scale-110' : 'opacity-0 hover:opacity-100'} transition-all duration-200`}
            >
              <GripVertical size={16} className="text-purple-300" />
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="flex-1 flex flex-col h-full relative z-10">
            <div className={`h-[60px] flex items-center justify-between px-4 border-b ${themeClasses}`}>
              <h1 className="text-lg font-semibold">Ollama Settings</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-purple-800/30 rounded-full transition-colors"
                  title="Toggle theme"
                >
                  {isLightTheme ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-purple-800/30 rounded-full transition-colors"
                  title="Save settings"
                >
                  <Save size={20} className={isSaved ? "text-green-400" : "text-purple-300"} />
                </button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${themeClasses}`}>
              {/* BaseURL */}
              <div className={`p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <label className="block text-sm font-medium mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  name="baseUrl"
                  value={baseUrl}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-1 border ${themeClasses}`}
                />
              </div>
              {/* Models */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <label className="block text-sm font-medium mb-2">
                  Model
                </label>
                <select
                  name="model"
                  value={model}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-1 border ${themeClasses}`}
                >
                  {settings.Model.all.map((model, index) => (
                    <option key={index} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              {/* Num CTX */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Context Window Size
                  </label>
                   <span className="text-sm text-purple-300">{num_ctx}</span> 
                </div>
                <input
                  type="range"
                  name="num_ctx"
                  min={settings.num_ctx.min}
                  max={settings.num_ctx.max}
                  step="256"
                  value={num_ctx}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500 mb-2"
                />
                <input
                  type="number"
                  name="num_ctx"
                  value={num_ctx}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-1 border ${themeClasses}`}
                />
              </div>
              {/* Temperature */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Temperature
                  </label>
                   <span className="text-sm text-purple-300">{temperature}</span> 
                </div>
                <input
                  type="range"
                  name="temperature"
                  min={settings.temperature.min}
                  max={settings.temperature.max}
                  step="0.1"
                  value={temperature}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              {/* Top P */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Top P
                  </label>
                  <span className="text-sm text-purple-300">{topP}</span>
                </div>
                <input
                  type="range"
                  name="topP"
                  min={settings.topP.min}
                  max={settings.topP.max}
                  step="0.1"
                  value={topP}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              {/* Frequency Penalty */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Frequency Penalty
                  </label>
                  <span className="text-sm text-purple-300">{fPenalty}</span> 
                </div>
                <input
                  type="range"
                  name="frequencyPenalty"
                  min={settings.frequencyPenalty.min}
                  max={settings.frequencyPenalty.max}
                  step="0.1"
                  value={fPenalty}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              {/* Presence Penalty */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Presence Penalty
                  </label>
                  <span className="text-sm text-purple-300">{pPenalty}</span>
                </div>
                <input
                  type="range"
                  name="presencePenalty"
                  min={settings.presencePenalty.min}
                  max={settings.presencePenalty.max}
                  step="0.1"
                  value={pPenalty}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              {/* Max Token */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">
                    Max Tokens
                  </label>
                  <span className="text-sm text-purple-300">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  name="maxTokens"
                  min={settings.maxTokens.min}
                  max={settings.maxTokens.max}
                  step="100"
                  value={maxTokens}
                  onChange={handleChange}
                  className="w-full h-2 bg-purple-900/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              {/* System Prompt */}
              <div className={`bg-black/60 border border-purple-500/20 p-4 rounded-lg backdrop-blur-md ${themeClasses}`}>
                <label className="block text-sm font-medium mb-2">
                  System Prompt
                </label>
                <textarea
                  name="systemPrompt"
                  value={sysPrompt}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-1 border ${themeClasses}`}
                />
              </div>

              <div className="mb-4">
                <button
                  onClick={handleSave}
                  className="w-full bg-purple-800/50 hover:bg-purple-700/60 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors border border-purple-500/30"
                >
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center pt-4 relative z-10">
            <button
              onClick={toggleSidebar}
              className="p-3 hover:bg-purple-800/30 rounded-full transition-colors"
            >
              <ChevronRight size={20} className="text-purple-300" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(138, 75, 175, 0.5) transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(138, 75, 175, 0.5);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(138, 75, 175, 0.7);
          }
        `}</style>
    </div>
  );
}
