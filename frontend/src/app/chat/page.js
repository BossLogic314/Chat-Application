"use client";
import React, { useEffect } from "react";
import io from "socket.io-client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CreateGroupChatPopUp from "../components/CreateGroupChatPopUp";
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";
import './styles/page.css'

export default function Page() {

  const [chats, setChats] = useState([]);
  const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
  const [socket, setSocket] = useState(null);
  const {username} = useUsernameStore();
  const [currentChat, setCurrentChat] = useState('');
  const [currentConversation, setCurrentConversation] = useState('');
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const router = useRouter();
  const [chatNameToParticipantsMap, setChatNameToParticipantsMap] = useState({});

  let getChats = (async () => {
    const searchString = document.getElementsByClassName('searchTab')[0].value;

    try {
      const response = await axios.get(`http://localhost:8080/chats/getAllChats?searchString=${searchString}`,
      {
        withCredentials: true,
      });
      const newChats = response.data.response;

      // If the search string is empty, storing a map of all chat names to participants
      let newChatNameToParticipantsMap = {};

      if (searchString == '') {
        for (let i = 0; i < newChats.length; ++i) {

          const name = newChats[i].name == undefined ? newChats[i].username : newChats[i].name;
          const participants = newChats[i].participants == undefined ? [username, newChats[i].username] : newChats[i].participants;

          // Participants are always sorted in alphabetical order
          participants.sort();

          newChatNameToParticipantsMap[name] = participants;
        }

        setChatNameToParticipantsMap(newChatNameToParticipantsMap);
      }

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

  let displayMessages = (async (chatName, isGroupChat) => {

    let conversationName = '';
    if (isGroupChat) {
      conversationName = chatName;
    }
    else {
      let list = [username, chatName];
      list.sort();
      conversationName = list[0] + '-' + list[1];
    }

    try {
      const response = await axios.get(`http://localhost:8080/conversation/getConversation?conversationName=${conversationName}`,
      {
        withCredentials: true,
      });
      let newMessages = [];
      if (response.data.response != null) {
        newMessages = response.data.response.messages;
      }
      setMessages(newMessages);
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      alert(error.response.data.message);
      router.replace('/');
    }
  });

  let chatClicked = ((event) => {

    const chat = event.target.textContent;

    for (let i = 0; i < chats.length; ++i) {

      // User
      if (chats[i].username != undefined && chats[i].username == chat) {
        // Conversation name in case of two users is 'user1-user2'
        const users = [username, chats[i].username];
        users.sort();
        setCurrentConversation(users[0] + '-' + users[1]);
        setCurrentChat(chats[i].username);
        displayMessages(chats[i].username, false);
        break;
      }

      // Group chat
      if (chats[i].name != undefined && chats[i].name == chat) {
        setCurrentConversation(chats[i].name);
        setCurrentChat(chats[i].name);
        displayMessages(chats[i].name, true);
        break;
      }
    }
  });

  let messageTyped = ((event) => {
    const newTypedMessage = document.getElementById('typingBox').value;
    setTypedMessage(newTypedMessage);
  });

  let sendButtonClicked = (async () => {

    const currentDate = new Date();
    const hours = ("0" + currentDate.getHours().toString()).slice(-2);
    const minutes = ("0" + currentDate.getMinutes().toString()).slice(-2);
    const seconds = ("0" + currentDate.getSeconds().toString()).slice(-2);
    const date = ("0" + currentDate.getDate().toString()).slice(-2);
    const month = ("0" + (currentDate.getMonth() + 1).toString()).slice(-2);
    const year= ("0" + currentDate.getFullYear().toString()).slice(-2);

    const newMessage = {
      from: username,
      to: currentChat,
      participants: chatNameToParticipantsMap[currentChat],
      message: typedMessage,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      date: date,
      month: month,
      year: year
    }

    socket.emit('chat', newMessage);

    /*try {
      // Saving the message in the database
      const response = await axios.post('http://localhost:8080/conversation/addMessageToConversation',
      {
        conversationName: currentConversation,
        from: username,
        to: currentChat,
        participants: chatNameToParticipantsMap[currentChat],
        message: typedMessage,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        date: date,
        month: month,
        year: year
      },
      {
        withCredentials: true
      });
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      alert(error.response.data.message);
      router.replace('/');
    }*/

    setMessages([...messages, newMessage]);

    setTypedMessage('');
  });

  useEffect(() => {

    const newSocket = io('http://localhost:8081', {
      query: {
        username: username
      }
    });
    setSocket(newSocket);

    newSocket.on('chat', (message) => {

      // Message did not come from another user
      if (message.from == username) {
        return;
      }
  
      const receivedMessage = {
        from: message.from,
        to: message.to,
        message: message.message,
        hours: message.hours,
        minutes: message.minutes,
        seconds: message.seconds,
        date: message.date,
        month: message.month,
        year: message.year
      }

      console.log(messages);
      setMessages([...messages, receivedMessage]);
    });

    getChats();

    return () => newSocket.close();
  }, [username]);

  return (
    <div className="flex flex-col box bg-white-200 h-screen w-screen">

      <div className="header flex flex-row h-16 justify-between">
        <div className="logo h-full w-40 border-black border"></div>
        <div className="userDP h-full w-40 border-black border"></div>
      </div>

      <div className="flex flex-row flex-1 h-full w-screen border-black border">
        <div className="chatsWindow w-1/3 h-full flex flex-col items-center border-red-400 border-2">
          <input
            className="searchTab w-full h-10 text-lg border-black border px-2 py-2"
            placeholder="Search for chats"
            onChange={getChats}>
          </input>
          
          {
            chats.map((chat, index) =>
            (
              <div className="chat flex flex-row h-[60px] w-[97%] border-black border mt-[2px] rounded hover:scale-[1.03] hover:cursor-pointer"
                id={chat.name == currentChat ? `currentChat` : (chat.username == currentChat ? `currentChat` : `chat`)}
                key={`chat-${index}`}
                onClick={chatClicked}>

                <img className="chatDisplayPicture h-[58px] w-20 border-red-400 border-2 rounded-full" key={`chatDisplayPicture-${index}`}></img>
                <div className="chatNameDiv flex flex-col h-full w-full border-yellow-400 border-2 ml-2 justify-center" key={`chatNameDiv-${index}`}>
                  <div className="chatName text-xl border-black border-2" key={`chatName-${index}`}>
                    {chat.name === undefined ? chat.username : chat.name}
                  </div>
                </div>

              </div>
            ))
          }

        </div>

        <div className="messagesWindow flex flex-col flex-1 w-full h-full border-green-400 border-2">

          <div className="messages flex-1 w-full border-black border-2">
            {
              messages.map((message, index) => (
                <div className={username == message.from ? 'messageSent' : 'messageReceived'} key={index}>

                  <div className='from text-[18px] italic pt-[3px] pb-[2px]' key={`from-${index}`}>
                      {message.from}
                  </div>

                  <div
                    className="text-[23px] pt-[3px] pb-[5px]"
                    id={username == message.from ? 'messageSentText' : 'messageReceivedText'}
                    key={`messageText-${index}`}>
                      {message.message}
                  </div>

                  <div className='messageDateTime text-[17px] pt-[2px] pb-[3px] text-right' key={`messageDateTime-${index}`}>
                  {
                      `${ message.hours }:${ message.minutes }:${ message.seconds }, ` +
                      `${ message.date }-${ message.month }-${ message.year }`
                  }
                  </div>

                </div>
              ))
            }
          </div>

          <div className="typingSection flex flex-row h-20 border-red-600 border-2 justify-center items-center justify-center">
            <button
              className="createGroupChatButton flex justify-center items-center h-10 w-20 border-blue-400 border-2 ml-8 mr-4 text-3xl hover:scale-[1.05] hover:cursor-pointer"
              onClick={createGroupChatButtonClicked}>
                +
            </button>

            <div className="typeAndSendSection w-4/5 flex flex-row">
              <input
                className="typingBox h-10 w-5/6 border-black border-2" id="typingBox"
                placeholder="Type your message here..." type="text" value={typedMessage}
                onChange={messageTyped}>
              </input>
              {
                typedMessage == '' || currentChat == '' ?
                  <button className="sendButton h-10 w-20 border-blue-400 border-2 mr-8" disabled onClick={sendButtonClicked}> </button>
                  :
                  <button className="sendButton h-10 w-20 border-blue-400 border-2 mr-8 hover:scale-[1.05] hover:cursor-pointer"
                    onClick={sendButtonClicked}>
                  </button>
              }
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
