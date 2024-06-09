import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import Users from './papes/users/Users';
import Levels from './papes/lessons/Levels';
import Topics from './papes/lessons/Topics';
import Quizzs from './papes/lessons/Quizzs';
import TabBar from './components/TabBar';
import Lessons from './papes/lessons/Lessons';
import Test from './papes/lessons/Test';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <TabBar>
          <Routes>
            <Route path="" element={<Levels />} />
            <Route path="/levels" element={<Levels />} /> 
            <Route path="/topics" element={<Topics />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/quizzs" element={<Quizzs />} />
          </Routes>
        </TabBar>
      </div>
    </BrowserRouter>
  );
}
