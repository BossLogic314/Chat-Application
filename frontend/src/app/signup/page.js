"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsernamePasswordStore } from "../../../zustand/useUsernamePasswordStore";
import axios from "axios";

export default function Page() {

  const {signupUsername, setSignupUsername, signupPassword, setSignupPassword, cleanupStore} = useUsernamePasswordStore();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();

  const signupEntered = async (e) => {

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
      {
        username: signupUsername,
        password: signupPassword,
      },
      {
        withCredentials: true,
      });
      // Cleaning the session storage on a successful signup
      cleanupStore();

      router.replace('/');
      alert(response.data.message);
    }
    catch(error) {
      alert(error.response.data.message);
    }
  }

  // When the user presses 'Enter' on input fields
  const keyPressedOnInputField = (event) => {

    if (event.key == 'Enter') {
      signupEntered();
    }
  }

  useEffect(() => {
    async function checkJwtToken() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/checkJwtToken`,
        {
          withCredentials: true,
        });
        router.replace('/chat');
      }
      catch(error) {
        setIsPageLoading(false);
      }
    }
    checkJwtToken();

  }, [])

  return (
    <div className="h-screen w-screen min-h-[450px] min-w-[450px] bg-blue-100 flex justify-center items-center">
      {
        isPageLoading ? <></> :
        <div className="bg-white rounded-lg min-h-[350px] px-12 py-8">
          <div className="text-5xl w-80 font-medium text-center">Welcome!</div>
          <div className="mt-3 w-80 text-2xl font-normal">Username</div>
          <input className="bg-gray-100 w-80 text-lg block mt-1 px-[8px] py-1 border-black border rounded"
            value={signupUsername} placeholder="Enter your username here"
            onChange={(e) => {setSignupUsername(e.target.value)}} onKeyDown={keyPressedOnInputField}>
          </input>

          <div className="mt-2 w-80 text-2xl font-normal">Password</div>
          <input className="bg-gray-100 w-80 text-lg block mt-1 px-[8px] py-1 border-black border rounded"
            value={signupPassword} placeholder="Enter your password here"
            type="password" onChange={(e) => {setSignupPassword(e.target.value)}} onKeyDown={keyPressedOnInputField}>
          </input>

          <div className="loginDiv flex flex-row justify-center">
            <button className="text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-md px-5 py-2.5 mt-2 hover:scale-[1.04] active:scale-[1]"
            onClick={signupEntered}>
              Signup
            </button>
          </div>

          <div className="signupMessageDiv w-80 italic mt-2">
            <div className="text-md max-w-full text-center">Already have an account?</div>
            <div className="text-md max-w-full text-center">Login <a className="underline underline-offset-4" href="/">here</a></div>
          </div>
        </div>
      }
    </div>
  );
}
