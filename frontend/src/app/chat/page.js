"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {

  const [chats, setChats] = useState([]);
  const router = useRouter();

  let getChats = (async () => {
    const searchString = document.getElementsByClassName('searchTab')[0].value;

    try {
      const response = await axios.get(`http://localhost:8080/chats/getAllChats?searchString=${searchString}`,
      {
        withCredentials: true,
      });
      const newChats = response.data.response;
      setChats(newChats);
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      alert(error.response.data.message);
      router.replace('/');
    }
  });

  useEffect(() => {
    getChats();
  }, []);

  return (
    <div className="flex flex-col box bg-white-200 h-screen w-screen">

      <div className="header flex flex-row h-16 justify-between">
        <div className="logo h-full w-40 border-black border"></div>
        <div className="userDP h-full w-40 border-black border"></div>
      </div>

      <div className="flex flex-row flex-1 h-full w-screen border-black border">
        <div className="chats w-1/3 h-full border-red-400 border-2">
          <input
            className="searchTab w-full h-10 text-lg border-black border px-2 py-2"
            placeholder="Search for chats"
            onChange={getChats}>
          </input>
          
          {
            chats.map((chat, index) =>
            (
              <div className="chat flex flex-row h-14 w-full border-black border mt-0.5 rounded" key={`chat-${index}`}>
                <img className="chatDisplayPicture h-full w-20 border-red-400 border-2" key={`chatDisplayPicture-${index}`}></img>
                <div className="chatNameDiv flex flex-col h-full w-full border-yellow-400 border-2 ml-2 justify-center" key={`chatNameDiv-${index}`}>
                  <div className="chatName text-xl border-black border-2" key={`chatName-${index}`}>
                    {chat.name === undefined ? chat.username : chat.name}
                  </div>
                </div>
              </div>
            ))
          }

        </div>

        <div className="messages flex-1 w-full h-full border-green-400 border-2">

        </div>
      </div>
    </div>
  );
}
