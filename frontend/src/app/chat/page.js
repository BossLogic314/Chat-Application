"use client";
import React, { useEffect } from "react";
import io from "socket.io-client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CreateGroupChatPopUp from "../components/CreateGroupChatPopUp";
import DisplayPicturePopUp from "../components/DisplayPicturePopUp";
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";
import { useCurrentChatStore } from "../../../zustand/useCurrentChatStore";
import { useMessagesStore } from "../../../zustand/useMessagesStore";
import { useChatsStore } from "../../../zustand/useChatStore";
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";
import { useDisplayPictureStore } from "../../../zustand/useDisplayPictureStore";
import { useSocketStore } from "../../../zustand/useSocketStore";
import logo from '../images/logo.png';
import './styles/page.css';

export default function Page() {

  const [isPageLoading, setIsPageLoading] = useState(true);
  const {chats, setChats, pushChatToTop, addToNumberOfUnreadMessagesOfChat, clearNumberOfUnreadMessagesOfChat} = useChatsStore();
  const {socket, setSocket} = useSocketStore();
  const {username, setUsername} = useUsernameStore();
  const {displayPicture, setDisplayPicture} = useDisplayPictureStore();
  const {currentChat, setCurrentChat, currentChatName, setCurrentChatName} = useCurrentChatStore();
  const [currentConversation, setCurrentConversation] = useState('');
  const [chatNameToDisplayPictureMap, setChatNameToDisplayPictureMap] = useState({});
  const {readMessages, setReadMessages, unreadMessages, setUnreadMessages, addToMessages} = useMessagesStore();
  const [typedMessage, setTypedMessage] = useState('');
  const router = useRouter();
  const [chatNameToParticipantsMap, setChatNameToParticipantsMap] = useState({});
  const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
  const {popUpDisplayPicture, setPopUpDisplayPicture} = usePopUpDisplayPictureStore();

  const defaultDisplayPicture = 'default.jpg';

  let logout = (async(req, res) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {},
        {
          withCredentials: true
        });
        // Clearing the configuration so that the user logs in to a fresh page next time
        clearState();
        router.replace('/');
    }
    catch(error) {
        // Jwt token expired, the user needs to login again
        clearState();
        router.replace('/');
    }
  });

  // Called when the user logs out
  const clearState = () => {
    setCreateGroupChat(false);
    setPopUpDisplayPicture(null);
    setChats([]);
    setCurrentChatName('');
    setCurrentChat({});
    setReadMessages([]);
    setUnreadMessages([]);
  }

  let getChats = (async (event, usernameValue=null) => {

    // If the page is not loaded yet, there is nothing to do
    if (isPageLoading) {
      return;
    }

    const searchString = document.getElementsByClassName('searchTab')[0].value;

    if (!usernameValue) {
      usernameValue = username;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/getAllChats?searchString=${searchString}&username=${usernameValue}`,
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
      logout();
    }
  });

  let createGroupChatButtonClicked = (async () => {
    // Information is not fully loaded yet
    if (username == '') {
      return;
    }
    setCreateGroupChat(true);
  });

  const separateReadAndUnreadMessages = (messages) => {

    let readMessages = [], unreadMessages = [];
    for (let i = 0; i < messages.length; ++i) {

      const readList = messages[i].readList;
      for (let j = 0; j < readList.length; ++j) {

        if (readList[j].username == username) {

          const read = readList[j].read;

          if (read) {
            readMessages.push(messages[i]);
          }
          else {
            unreadMessages.push(messages[i]);
          }

          break;
        }
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation/getConversation?conversationName=${conversationName}`,
      {
        withCredentials: true,
      });
      let newMessages = [], newReadMessages = [], newUnreadMessages = [];
      if (response.data.response != null) {
        newMessages = response.data.response.messages;

        // Separating into read and unread messages
        [newReadMessages, newUnreadMessages] = separateReadAndUnreadMessages(newMessages);
      }

      // Marking all messages of chat as 'read' for the current user
      await markMessagesOfConversationToRead(conversationName);
      clearNumberOfUnreadMessagesOfChat(chatName);

      setReadMessages(newReadMessages);
      setUnreadMessages(newUnreadMessages);
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      logout();
    }
  });

  let chatClicked = (async (event) => {

    if (event.target.id == 'chatDisplayPictureDiv' || event.target.id == 'chatDisplayPicture') {
      return;
    }

    // Marking all messages of the currently-opened chat as 'read' for the current user
    await markMessagesOfConversationToRead();

    // Clearing the number of unread messages of the current chat
    if (currentChatName != '') {
      clearNumberOfUnreadMessagesOfChat(currentChatName);
    }

    const chat = event.target.getAttribute('value');

    // Iterating over all chats and picking the chat that was clicked
    for (let i = 0; i < chats.length; ++i) {

      // Not the chat that was clicked
      if (chats[i].name != chat) {
        continue;
      }

      // If the same chat is clicked again, update the unread messages
      if (currentChatName == chats[i].name) {
        displayMessagesOfConversation();
      }

      setCurrentChat(chats[i]);
      setCurrentChatName(chats[i].name);
      break;
    }
  });

  let messageTyped = ((event) => {
    const newTypedMessage = document.getElementById('typingBox').value;
    setTypedMessage(newTypedMessage);
  });

  // Marking messages of the current conversation as 'read' for the current user
  let markMessagesOfConversationToRead = async (conversationName=null) => {

    if (conversationName == null) {
      conversationName = currentConversation;
    }

    // If no chat is clicked
    if (conversationName == '') {
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation/markMessageOfConversationAsRead`,
      {
        conversationName: conversationName,
        username: username
      },
      {
        withCredentials: true
      });
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      logout();
    }
  };

  let displayPictureClicked = (async (event) => {

    const chatName = event.target.getAttribute('value');
    const canChangeDisplayPicture = event.target.getAttribute('can-change-display-picture');
    const displayPicture = event.target.getAttribute('display-picture');
    const participants = event.target.getAttribute('participants');
    // The information is not fully loaded let
    if (displayPicture == '') {
      return;
    }
    setPopUpDisplayPicture(
      {
        name: chatName, displayPicture: displayPicture,
        canChangeDisplayPicture: canChangeDisplayPicture,
        participants: participants
      }
    );
  });

  let sendButtonClicked = (async () => {

    const currentDate = new Date();
    const hours = ("0" + currentDate.getHours().toString()).slice(-2);
    const minutes = ("0" + currentDate.getMinutes().toString()).slice(-2);
    const seconds = ("0" + currentDate.getSeconds().toString()).slice(-2);
    const date = ("0" + currentDate.getDate().toString()).slice(-2);
    const month = ("0" + (currentDate.getMonth() + 1).toString()).slice(-2);
    const year= ("0" + currentDate.getFullYear().toString()).slice(-4);

    const readList = chatNameToParticipantsMap[currentChatName].map((participant) => ({
      "username": participant,
      "read": participant == username ? true : false
    }));

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

    try {
      // Saving the message in the database
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/conversation/addMessageToConversation`,
      {
        conversationName: currentConversation,
        from: username,
        to: currentChatName,
        participants: chatNameToParticipantsMap[currentChatName],
        readList: readList,
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

      // Marking all messages of chat as 'read' for the current user
      await markMessagesOfConversationToRead();
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      logout();
    }

    setTypedMessage('');
  });

  const verifyJwtTokenAndGetUsername = async() => {

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/checkJwtToken`,
      {
        withCredentials: true,
      });
      setUsername(response.data.username);
      setDisplayPicture(response.data.displayPicture);
      setIsPageLoading(false);
      return response.data.username;
    }
    catch(error) {
      // Jwt token expired, the user needs to login again
      logout();
    }
  };

  const initialize = async() => {

    const usernameValue = await verifyJwtTokenAndGetUsername();

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_SOCKET_URL, {
      query: {
        username: usernameValue
      }
    });
    setSocket(newSocket);

    // Called when a new group chat is created with the current user involved in it
    newSocket.on('groupChatCreated', () => {
      getChats(null, usernameValue);
    })

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

      // Self-message
      if (receivedMessage.from == usernameValue) {
        clearNumberOfUnreadMessagesOfChat(receivedMessage.to);
      }
      else {
        // Direct message
        if (receivedMessage.to == usernameValue) {
          addToNumberOfUnreadMessagesOfChat(receivedMessage.from);
        }
        // Group chat
        else {
          addToNumberOfUnreadMessagesOfChat(receivedMessage.to);
        }
      }
    });

    getChats(null);
  };

  const displayMessagesOfConversation = () => {
    let conversationName = null;
    // User
    if (!currentChat.isGroupChat) {
      // Conversation name in case of two users is 'user1-user2'
      conversationName = [username, currentChat.name].sort().join('-');
    }
    // Group chat
    else {
      conversationName = currentChat.name;
    }

    setCurrentConversation(conversationName);
    setCurrentChatName(currentChat.name);
    displayMessages(currentChat.name, currentChat.isGroupChat);
  }
  
  const keyPressedOnMessageField = (event) => {
    if (event.key == 'Enter') {
      document.getElementById('sendButton').click();
    }
  }

  // When the page loads
  useEffect(() => {

    initialize();

    return () => {
      if (socket) {
        socket.close();
      }
    };

  }, []);

  // When the check whether the user is logged in is complete
  useEffect(() => {

    // Nothing to do if the page is not loaded yet
    if (isPageLoading) {
      return;
    }

    getChats(null, username);
  }, [username, isPageLoading]);

  // When chats change
  useEffect(() => {

    // Nothing to do if the page is not loaded yet
    if (isPageLoading || displayPicture == '') {
      return;
    }

    const newChatNameToDisplayPictureMap = {...chatNameToDisplayPictureMap};
    for (let i = 0; i < chats.length; ++i) {
      newChatNameToDisplayPictureMap[chats[i].name] = chats[i].displayPicture;
    }
    newChatNameToDisplayPictureMap[username] = displayPicture;
    setChatNameToDisplayPictureMap(newChatNameToDisplayPictureMap);
  }, [chats, isPageLoading, displayPicture]);

  useEffect(() => {

    // Nothing to do if the page is not loaded yet
    if (isPageLoading || username == '') {
      return;
    }

    // The username or the current chat is not assigned yet
    if (Object.keys(currentChat).length == 0) {
      return;
    }

    displayMessagesOfConversation();

  }, [username, currentChat, isPageLoading]);

  return (
    isPageLoading ? <></> :
    <div className="flex flex-col box bg-red h-screen w-screen min-h-[700px] min-w-[850px] mx-auto px-[10px] py-[10px]">

      <div className="header flex flex-row h-[75px] min-h-[75px] justify-between">
        <div className="logo h-full w-[130px] ml-[8px]">
          <img className="h-full w-full" src={logo.src}></img>
        </div>
        <div className="userDisplayPictureDiv flex h-full w-40 justify-center items-center">
          <img className="userDisplayPicture h-[68px] w-[68px] rounded-full hover:cursor-pointer hover:scale-[1.03] active:scale-[1] border-black border-[1px]"
            src={displayPicture == '' ?
              `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${defaultDisplayPicture}` :
              `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${displayPicture}`}
            value={username}
            participants={[]}
            display-picture={displayPicture}
            can-change-display-picture="true"
            onClick={displayPictureClicked}>
          </img>
        </div>
      </div>

      <div className="flex flex-row flex-1 h-[100%] overflow-y-hidden border-black border-[1px]">
        <div className="chatsWindow w-[30%] max-w-[400px] h-full flex flex-col items-center border-black border-r-[1px]"
        id="chatsWindow">
          <input
            className="searchTab w-[98%] h-10 text-lg font-[400] border-black border-b-[1px] px-2 py-2 mx-[2px]"
            placeholder="Search for chats"
            onChange={getChats}>
          </input>
          
          <div className="chats h-full w-full flex flex-col items-center overflow-y-auto">
            {
              chats.map((chat, index) =>
              (
                <div className="chat flex flex-row h-[80px] w-[96%] border-black border-b-[1px] mt-[4px] pb-[2px] rounded hover:scale-[1.03] hover:cursor-pointer active:scale-[1] justify-center items-center"
                  id={chat.name == currentChatName ? `currentChat` : `chat`}
                  value={chat.name}
                  key={`chat-${index}`}
                  onClick={chatClicked}>

                  <div className="chatDisplayPictureDiv h-[70px] min-w-[70px] flex justify-center items-center rounded-full"
                    key={`chatDisplayPictureDiv-${index}`}
                    value={chat.name}
                    id="chatDisplayPictureDiv">
                      <img
                        className="chatDisplayPicture h-[65px] w-[65px] mt-[4px] ml-[3px] border-black border-[1px] rounded-full"
                        src={`https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chat.displayPicture}`}
                        key={`chatDisplayPicture-${index}`}
                        value={chat.name}
                        participants={chat.isGroupChat ? chat.participants : []}
                        display-picture={chat.displayPicture}
                        can-change-display-picture={chat.isGroupChat ? "true" : "false"}
                        id="chatDisplayPicture"
                        onClick={displayPictureClicked}>
                      </img>
                  </div>

                  <div className="chatNameDiv flex flex-col h-full w-full ml-2 mr-[8px] justify-center overflow-hidden" key={`chatNameDiv-${index}`} value={chat.name}>
                    <div className="chatName text-[23px] font-[470] truncate ..." key={`chatName-${index}`} value={chat.name}>
                      {chat.name}
                    </div>
                    <div className="chatLastMessage text-[17px] font-[400] w-[100%] truncate ..." key={`chatLastMessage-${index}`} value={chat.name}
                    id="chatLastMessage">
                      {chat.lastMessage.message}
                    </div>
                  </div>

                  {
                    chat.numberOfUnreadMessages != 0 ?
                    (
                      <div className="numberOfUnreadMessages text-[21px] h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex justify-center items-center mr-[8px] rounded-full truncate ..."
                      id="numberOfUnreadMessages"
                      value={chat.name}>
                        {chat.numberOfUnreadMessages}
                      </div>
                    ) :
                    <></>
                  }

                </div>
              ))
            }
          </div>

        </div>

        <div className="messagesWindow flex flex-col flex-1 w-full h-full" id="messagesWindow">

          <div className="readUnreadMessagesWindow flex flex-col-reverse h-full max-h-full overflow-y-auto">

            <div className="unreadMessages flex-1 w-full">
              {
                unreadMessages.map((message, index) => (
                  <div className="displayPictureAndMessage flex flex-row my-[4px] mx-[4px]" key={`displayPictureAndMessage-${index}`}>
                    {
                      username != message.from ?
                      <img className="displayPicture h-[55px] w-[55px] rounded-full border-black border-[1px]"
                        src={chatNameToDisplayPictureMap[message.from] == null ?
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${defaultDisplayPicture}` :
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chatNameToDisplayPictureMap[message.from]}`}>
                      </img> :
                      <></>
                    }
                    <div className={username == message.from ? 'messageSent' : 'messageReceived'} key={index}>
                      <div className='from text-[18px] italic pt-[3px] pb-[2px] px-[3px]' key={`from-${index}`}>
                          {message.from}
                      </div>

                      <div
                        className="text-[23px] pt-[3px] pb-[5px] px-[5px]"
                        id={username == message.from ? 'messageSentText' : 'messageReceivedText'}
                        key={`messageText-${index}`}>
                          {message.message}
                      </div>

                      <div className='messageDateTime text-[17px] pt-[2px] pb-[3px] px-[8px] text-right' key={`messageDateTime-${index}`}>
                      {
                          `${ message.hours }:${ message.minutes }:${ message.seconds }, ` +
                          `${ message.date }-${ message.month }-${ message.year }`
                      }
                      </div>
                    </div>
                    {
                      username == message.from ?
                      <img className="displayPicture h-[55px] w-[55px] rounded-full border-black border-[1px]"
                        src={chatNameToDisplayPictureMap[message.from] == null ?
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${defaultDisplayPicture}` :
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chatNameToDisplayPictureMap[message.from]}`}>
                      </img> :
                      <></>
                    }
                  </div>
                ))
              }
            </div>
            {
              unreadMessages.length != 0 ?
                <div className="unreadMessagesNotice text-[20px] text-center italic font-[650]" id="unreadMessagesNoticeVisible">Unread messages</div> :
                <div className="unreadMessagesNotice text-[20px]" id="unreadMessagesNoticeHidden"></div>
            }
            <div className="readMessages w-full">
              {
                readMessages.map((message, index) => (
                  <div className="displayPictureAndMessage flex flex-row my-[4px] mx-[4px]" key={`displayPictureAndMessage-${index}`}>
                    {
                      username != message.from ?
                      <img className="displayPicture h-[55px] w-[55px] rounded-full border-black border-[1px]"
                        src={chatNameToDisplayPictureMap[message.from] == null ?
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${defaultDisplayPicture}` :
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chatNameToDisplayPictureMap[message.from]}`}>
                      </img> :
                      <></>
                    }
                    <div className={username == message.from ? 'messageSent' : 'messageReceived'} key={index}>
                      <div className='from text-[18px] italic pt-[3px] pb-[2px] px-[3px]' key={`from-${index}`}>
                          {message.from}
                      </div>

                      <div
                        className="text-[23px] pt-[3px] pb-[5px] px-[5px]"
                        id={username == message.from ? 'messageSentText' : 'messageReceivedText'}
                        key={`messageText-${index}`}>
                          {message.message}
                      </div>

                      <div className='messageDateTime text-[17px] pt-[2px] pb-[3px] px-[8px] text-right' key={`messageDateTime-${index}`}>
                      {
                          `${ message.hours }:${ message.minutes }:${ message.seconds }, ` +
                          `${ message.date }-${ message.month }-${ message.year }`
                      }
                      </div>
                    </div>
                    {
                      username == message.from ?
                      <img className="displayPicture h-[55px] w-[55px] rounded-full border-black border-[1px]"
                        src={chatNameToDisplayPictureMap[message.from] == null ?
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${defaultDisplayPicture}` :
                          `https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chatNameToDisplayPictureMap[message.from]}`}>
                      </img> :
                      <></>
                    }
                  </div>
                ))
              }
            </div>

          </div>

          <div className="emptyDiv w-[90%] border-black border-t-[1.5px] ml-[5%]" id="emptyDiv"></div>

          <div className="typingSection flex flex-row h-20 border-black justify-center items-center justify-center"
          id="typingSection">
            <div className="typingSectionElements flex flex-row w-[80%]">
              <button
                className="createGroupChatButton flex justify-center items-center h-[44px] w-[48px] mr-[10px] border-black border-[1px] text-[30px] hover:scale-[1.05] active:scale-[1]"
                id="createGroupChatButton"
                onClick={createGroupChatButtonClicked}>
                  +
              </button>

              <input
                className="typingBox h-10 w-5/6 pl-[5px] border-black border-[1px]" id="typingBox"
                placeholder="Type your message here..." type="text" value={typedMessage}
                onChange={messageTyped} onKeyDown={keyPressedOnMessageField}>
              </input>
              {
                typedMessage == '' || currentChatName == '' ?
                  <div className="sendButton flex justify-center items-center h-[44px] w-[44px] ml-[7px]"
                    id="sendButton">
                      <div className="sendShape ml-[15%]" id="sendShape"></div>
                  </div>
                  :
                  <div className="sendButton flex justify-center items-center h-[44px] w-[44px] ml-[7px] hover:scale-[1.05] active:scale-[1] hover:cursor-pointer"
                    id="sendButton" onClick={sendButtonClicked}>
                      <div className="sendShape ml-[15%]" id="sendShape"></div>
                  </div>
              }
            </div>
          </div>

        </div>
      </div>

      {
        createGroupChat ? <CreateGroupChatPopUp chatNameToDisplayPictureMap={chatNameToDisplayPictureMap} /> : <></>
      }

      {
        popUpDisplayPicture != null ?
          <DisplayPicturePopUp
            name={popUpDisplayPicture.name}
            displayPicture={popUpDisplayPicture.displayPicture}
            canChangeDisplayPicture={popUpDisplayPicture.canChangeDisplayPicture}
            participants={popUpDisplayPicture.participants}
            clearState={clearState}
            logout={logout} /> :
          <></>
      }
    </div>
  );
}
