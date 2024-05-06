"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signupEntered = async (e) => {

    try {
      const response = await axios.post('http://localhost:8080/auth/signup',
      {
        username: username,
        password: password,
      },
      {
        withCredentials: true,
      });
      router.replace('/');
      alert(response.data.message);
    }
    catch(error) {
      alert(error.response.data.message);
    }
  }

  useEffect(() => {
    async function checkJwtToken() {
      try {
        const response = await axios.get('http://localhost:8080/auth/checkJwtToken',
        {
          withCredentials: true,
        });
        router.replace('/chat');
      }
      catch(error) {
      }
    }
    checkJwtToken();

  }, [])

  return (
    <div className="h-screen w-screen bg-blue-100 flex justify-center items-center">
      <div className="bg-white rounded-lg px-12 py-8">
        <div className="text-5xl w-80 font-medium text-center">Welcome!</div>
        <div className="mt-3 w-80 text-2xl font-normal">Username</div>
        <input className="bg-gray-100 w-80 text-lg block mt-1 px-3 py-1 border-black border rounded"
          value={username} placeholder="Enter your username here"
          onChange={(e) => {setUsername(e.target.value)}}>
        </input>

        <div className="mt-2 w-80 text-2xl font-normal">Password</div>
        <input className="bg-gray-100 w-80 text-lg block mt-1 px-3 py-1 border-black border rounded"
          value={password} placeholder="Enter your password here"
          type="password" onChange={(e) => {setPassword(e.target.value)}}>
        </input>

        <div className="loginDiv flex flex-row justify-center">
          <button className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-md px-5 py-2.5 mt-2" onClick={signupEntered}>Signup</button>
        </div>

        <div className="signupMessageDiv w-80 italic mt-2">
          <div className="text-md max-w-full text-center">Already have an account?</div>
          <div className="text-md max-w-full text-center">Login <a className="text-blue-400 underline underline-offset-4" href="/">here</a></div>
        </div>
      </div>
    </div>
  );
}
