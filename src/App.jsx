// App.jsx
import React, { useState, useEffect } from 'react';
import LeftSlideNav from './components/LeftSlideNav';
import MiddleChatBox from './components/MiddleChatBox';
import RightSlideNav from './components/RightSlideNav';

export default function App() {


  return (
    <div className='flex max-h-screen h-screen overflow-hidden'>
      <LeftSlideNav/>
      <MiddleChatBox/>
      <RightSlideNav/>
    </div>
  );
}