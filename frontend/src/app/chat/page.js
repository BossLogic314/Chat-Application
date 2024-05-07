"use client";
import React, { useEffect } from "react";
import io from "socket.io-client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CreateGroupChatPopUp from "../components/CreateGroupChatPopUp";
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";

export default function Page() {

  const [chats, setChats] = useState([]);
  const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
  const [socket, setSocket] = useState(null);
  const {username, setUsername} = useUsernameStore();
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

  let createGroupChatButtonClicked = (async () => {
    setCreateGroupChat(true);
  });

  useEffect(() => {

    const newSocket = io('http://localhost:8081', {
      username: 'anish'
    });
    setSocket(newSocket);

    newSocket.on('chat', (message) => {
      console.log(`Got message ${message}`);
    });

    getChats();

    return () => newSocket.close();
  }, []);

  return (
    <div className="flex flex-col box bg-white-200 h-screen w-screen">

      <div className="header flex flex-row h-16 justify-between">
        <div className="logo h-full w-40 border-black border"></div>
        <div className="userDP h-full w-40 border-black border"></div>
      </div>

      <div className="flex flex-row flex-1 h-full w-screen border-black border">
        <div className="chats-window w-1/3 h-full border-red-400 border-2">
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

        <div className="messages-window flex flex-col flex-1 w-full h-full border-green-400 border-2">

          <div className="messages flex-1 w-full border-black border-2"></div>

          <div className="typingSection flex flex-row h-20 border-red-600 border-2 justify-center items-center justify-center">
            <div
              className="createGroupChatButton flex justify-center items-center h-10 w-20 border-blue-400 border-2 ml-8 mr-4 text-3xl"
              onClick={createGroupChatButtonClicked}>
                +
            </div>

            <div className="typeAndSendSection w-4/5 flex flex-row">
              <input className="typingBox h-10 w-5/6 border-black border-2" placeholder="Type your message here..." ></input>
              <div className="sendButton h-10 w-20 border-blue-400 border-2 mr-8"></div>
            </div>
          </div>

        </div>
      </div>

      {
        createGroupChat ? <CreateGroupChatPopUp /> : <></>
      }
    </div>
  );
}
