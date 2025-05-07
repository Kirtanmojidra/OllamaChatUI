import { createSlice, nanoid } from "@reduxjs/toolkit";


let initialState = {
    messages:[
    ],
    CurrentChat:"",
    Chats:[
        {
            "id":nanoid(),
            "title":"Hello World",
            "createdAt":Date.now()
        },
        {
            "id":nanoid(),
            "title":"Python Code And More",
            "createdAt":Date.now()
        },
        {
            "id":nanoid(),
            "title":"JSX Error Solving",
            "createdAt":Date.now()
        },
        {
            "id":nanoid(),
            "title":"Last Response Error",
            "createdAt":Date.now()
        }
    ],
    Settings:{
        "BaseUrl":{
            "url":"http://localhost:11434"
        },
        "Model":{
            "selected":"qwen2.5-coder",
            "all":[]
        },
        "num_ctx":{
            "default":4096,
            "min":1024,
            "max":16384
        },
        "temperature":{
            "default":0.5,
            "min":0,
            "max":1,
        },
        "topP":{
            "default":0.9,
            "min":0,
            "max":1
        },
        "frequencyPenalty":{
            "default":0.9,
            "min":0,
            "max":2
        },
        "presencePenalty":{
            "default":0.5,
            "min":0,
            "max":2
        },
        "maxTokens":{
            "default":200,
            "min":100,
            "max":4000
        },
        "systemPrompt":{
            "content":"You Are HelpFull Assistant"
        }
    }
}

initialState.CurrentChat = initialState.Chats[0].id
if(!localStorage.getItem("initialState")){
    
}else{
    initialState = JSON.parse(localStorage.getItem("initialState"))
}

const response = await fetch("http://localhost:11434/api/tags",{
    "method":"GET",
    headers:{
        "Content-Type":"application/json",
    }
})
if(response){
    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    while(true){
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const jsonData = JSON.parse(chunk);
        jsonData.models.map((model,index)=>initialState.Settings.Model.all.push(model.name))
    }
}
else{
    console.log("error")
}
export const ChatSlice = createSlice(
    {
        name:"OllamaChat",
        initialState,
        reducers:{
            GetChatMessages:(state,action)=>{
                console("Chat ID :"+action.payload)
            },
            SendChatMessage:(state,action)=>{
                const message = {
                    id: nanoid(),
                    type: action.payload.type,
                    content: action.payload.content
                  };
                  const updatedState= {
                    ...state,
                    messages: [...state.messages, message]
                  };
                  localStorage.setItem("initialState",JSON.stringify(updatedState))
                  return updatedState
            },
            DeleteChat: (state, action) => {
                console.log("Deleting chat with ID:", action.payload.id);
                const updatedChats = state.Chats.filter(chat => chat.id !== action.payload.id);
                const updatedState= {
                    ...state,
                    Chats: updatedChats
                };
                localStorage.setItem("initialState",JSON.stringify(updatedState))
                return updatedState
              },
              
              AddChat: (state, action) => {
                const newChat = action.payload
                const updatedState= {
                  ...state,
                  Chats: [...state.Chats, newChat] 
                };
                localStorage.setItem("initialState",JSON.stringify(updatedState))
                return updatedState
              },
            SelectChat:(state,action)=>{
                console.log(action.payload.id)
            },
            GetSettings:(state,action)=>{
                return state.Settings
            },
            UpdateSettings:(state,action)=>{
                if(action.payload.name == "num_ctx"){
                    state.Settings.num_ctx.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if (action.payload.name == "temperature"){
                    state.Settings.temperature.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "topP"){
                    state.Settings.topP.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "frequencyPenalty"){
                    state.Settings.frequencyPenalty.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "presencePenalty"){
                    state.Settings.presencePenalty.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "maxTokens"){
                    state.Settings.maxTokens.default = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "baseUrl"){
                    state.Settings.BaseUrl.url = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "systemPrompt"){
                    state.Settings.systemPrompt.content = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }else if(action.payload.name == "model"){
                    state.Settings.Model.selected = action.payload.value
                    localStorage.setItem("initialState",JSON.stringify(state))
                }
            }
        }
    }
)

export const { GetChatMessages,SendChatMessage,DeleteChat,AddChat,SelectChat,GetSettings,UpdateSettings } = ChatSlice.actions
export default ChatSlice.reducer