import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router";
import {Toaster} from "react-hot-toast";
import {HomePage} from "./pages/HomePage.jsx";
import { authStore } from './store/authStore.js';
import { useEffect } from 'react';
import PageLoader from './components/PageLoader.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';



function App() {
  const {checkAuth, isCheckingAuth, authUser} = authStore();
  useEffect(()=>{
    checkAuth()
  }, [checkAuth]);
  
  if(isCheckingAuth) return <PageLoader />
  return (
    <div>
      <Routes>
        <Route path="/" element={authUser? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={!authUser? <LoginPage/> : <Navigate to="/"/>}/>
        <Route path="/signup" element={!authUser? <SignupPage/> : <Navigate to="/"/>}/>
        <Route path="/dashboard" element={authUser? <DashboardPage/> : <Navigate to="/login"/>}/>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
