"use client";
import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CreateGroupChatPopUp from "../components/CreateGroupChatPopUp";
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";
import { useCurrentChatNameStore } from "../../../zustand/useCurrentChatNameStore";
import { useCurrentChatStore } from "../../../zustand/useCurrentChatStore";
import { useMessagesStore } from "../../../zustand/useMessagesStore";
import { useChatsStore } from "../../../zustand/useChatStore";
import './styles/page.css'

export default function Page() {

  const {chats, setChats, pushChatToTop} = useChatsStore();
  const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
  const [socket, setSocket] = useState(null);
  const {username, setUsername} = useUsernameStore();
  const {currentChatName, setCurrentChatName} = useCurrentChatNameStore();
  const {currentChat, setCurrentChat} = useCurrentChatStore();
  const [currentConversation, setCurrentConversation] = useState('');
  const {readMessages, setReadMessages, unreadMessages, setUnreadMessages, addToMessages} = useMessagesStore();
  const [typedMessage, setTypedMessage] = useState('');
  const router = useRouter();
  const [chatNameToParticipantsMap, setChatNameToParticipantsMap] = useState({});

  let getChats = (async (event, usernameValue=null) => {

    const searchString = document.getElementsByClassName('searchTab')[0].value;

    if (!usernameValue) {
      usernameValue = username;
    }

    try {
      const response = await axios.get(`http://localhost:8080/chats/getAllChats?searchString=${searchString}&username=${usernameValue}`,
      {
        withCredentials: true,
      });
      const newChats = response.data.response;

      // If the search string is empty, storing a map of all chat names to participants
      let newChatNameToParticipantsMap = {};

      for (let i = 0; i < newChats.length; ++i) {
        newChatNameToParticipantsMap[newChats[i].name] = newChats[i].participants;
      }

      setChatNameToParticipantsMap(newChatNameToParticipantsMap);

      // Sorting chat objects based on the last message exchanged
      newChats.sort(function(chat1, chat2) {
        const message1 = chat1.lastMessage;
        const message2 = chat2.lastMessage;

        if (message1.year != message2.year) {
            return message2.year - message1.year;
        }

        if (message1.month != message2.month) {
            return message2.month - message1.month;
        }

        if (message1.date != message2.date) {
            return message2.date - message1.date;
        }

        if (message1.hours != message2.hours) {
            return message2.hours - message1.hours;
        }

        if (message1.minutes != message2.minutes) {
            return message2.minutes - message1.minutes;
        }

        if (message1.seconds != message2.seconds) {
            return message2.seconds - message1.seconds;
        }
      });

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

  const separateReadAndUnreadMessages = (messages) => {

    let readMessages = [], unreadMessages = [];
    for (let i = 0; i < messages.length; ++i) {
      const read = messages[i].readList[username];

      if (read) {
        readMessages.push(messages[i]);
      }
      else {
        unreadMessages.push(messages[i]);
      }
    }
    return [readMessages, unreadMessages];
  }

  let displayMessages = (async (chatName, isGroupChat) => {

    let conversationName = '';
    if (isGroupChat) {
      conversationName = chatName;
    }
    else {
      conversationName = [username, chatName].sort().join('-');
    }

    try {
      const response = await axios.get(`http://localhost:8080/conversation/getConversation?conversationName=${conversationName}`,
      {
        withCredentials: true,
      });
      let newMessages = [], newReadMessages = [], newUnreadMessages = [];
      if (response.data.response != null) {
        newMessages = response.data.response.messages;

        // Separating into read and unread messages
        [newReadMessages, newUnreadMessages] = separateReadAndUnreadMessages(newMessages);
      }
      setReadMessages(newReadMessages);
      setUnreadMessages(newUnreadMessages);
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      alert(error.response.data.message);
      router.replace('/');
    }
  });

  let chatClicked = ((event) => {

    const chat = event.target.textContent;

    // Iterating over all chats and picking the chat that was clicked
    for (let i = 0; i < chats.length; ++i) {

      // Not the chat that was clicked
      if (chats[i].name != chat) {
        continue;
      }

      let conversationName = null;

      // User
      if (!chats[i].isGroupChat) {
        // Conversation name in case of two users is 'user1-user2'
        conversationName = [username, chats[i].name].sort().join('-');
      }
      // Group chat
      else {
        conversationName = chats[i].name;
      }

      setCurrentConversation(conversationName);
      setCurrentChatName(chats[i].name);
      displayMessages(chats[i].name, chats[i].isGroupChat);
      break;
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
      to: currentChatName,
      participants: chatNameToParticipantsMap[currentChatName],
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
        to: currentChatName,
        participants: chatNameToParticipantsMap[currentChatName],
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

    setTypedMessage('');
  });

  const verifyJwtTokenAndGetUsername = async() => {

    try {
      const response = await axios.get('http://localhost:8080/auth/checkJwtToken',
      {
        withCredentials: true,
      });
      setUsername(response.data.username);
      return response.data.username;
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      alert(error.response.data.message);
      router.replace('/');
    }
  };

  const initialize = async() => {

    const usernameValue = await verifyJwtTokenAndGetUsername();

    const newSocket = io('http://localhost:8081', {
      query: {
        username: usernameValue
      }
    });
    setSocket(newSocket);

    newSocket.on('chat', (message) => {
  
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

      // To push the chat to the top
      pushChatToTop(receivedMessage);

      // Adding the received message to the displaying list
      addToMessages(receivedMessage);
    });

    getChats(null, usernameValue);
  };

  useEffect(() => {

    initialize();

    return () => {
      if (socket) {
        socket.close();
      }
    };

  }, []);

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
                id={chat.name == currentChatName ? `currentChat` : `chat`}
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

          <div className="readMessages flex-1 w-full border-black border-2">
            {
              readMessages.map((message, index) => (
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

          {
            unreadMessages.length != 0 ?
              <div className="unreadMessagesNotice text-10px">Unread messages</div> :
              <div className="unreadMessagesNotice text-10px"></div>
          }

          <div className="unreadMessages flex-1 w-full border-black border-2">
            {
              unreadMessages.map((message, index) => (
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
                typedMessage == '' || currentChatName == '' ?
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
