import { configureStore } from "@reduxjs/toolkit";
import ChatReducers from '../features/ChatFeature.js'
export default configureStore({
    reducer:ChatReducers
})