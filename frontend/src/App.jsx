import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router";
import {Toaster} from "react-hot-toast";
import {HomePage} from "./pages/HomePage.jsx"
function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
