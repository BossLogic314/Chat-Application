import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import './styles/CreateGroupChatPopUp.css';
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";

export default function CreateGroupChatPopUp() {

    const [suggestedParticipants, setSuggestedParticipants] = useState([]);
    const [addedParticipants, setAddedParticipants] = useState([]);
    const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
    const {username} = useUsernameStore();
    const router = useRouter();

    let closeGroupChatPopUp = ((event) => {

        if (event.target.id != 'createGroupChatPopUpOverlay') {
            return;
        }
        setCreateGroupChat(false);
    });

    let searchForUsers = (async () => {
        const searchString = document.getElementById('groupChatParticipants').value;
        if (searchString !== '') {
            try {
                const response = await axios.get(`http://localhost:8080/users/getUsers?searchString=${searchString}&username=${username}`,
                {
                    withCredentials: true
                });
                setSuggestedParticipants(response.data.response);
            }
            catch(error) {
                // Jwt token expired, the user needs to login again
                alert(error.response.data.message);
                router.replace('/');
            }
        }
        else {
            // If the search string is empty, no participants should be suggested
            setSuggestedParticipants([]);
        }
    });

    let createButtonClicked = (async () => {

        const groupChatName = document.getElementById('groupChatName').value;

        if (groupChatName == '') {
            alert("Group chat's name cannot be empty");
            return;
        }

        if (groupChatName.length < 7) {
            alert("Group chat's name needs to be atleast 7 characters long");
            return;
        }

        if (addedParticipants.length == 0) {
            alert("Group chat needs to have atleast 2 participants");
            return;
        }

        // Information provided is valid
        try {
            const response = await axios.post('http://localhost:8080/chats/createGroupChat',
            {
                name: groupChatName,
                participants: addedParticipants
            },
            {
                withCredentials: true
            });

            alert('Group chat successfully created!');
            setCreateGroupChat(false);
        }
        catch(error) {
            // Jwt token expired, the user needs to login again
            alert(error.response.data.message);
            router.replace('/');
        }
    });

    let removeAddedParticipant = ((event) => {
        
        const participant = event.target.getAttribute('value');
        
        let newAddedParticipants = [];
        for (let i = 0; i < addedParticipants.length; ++i) {

            if (participant === addedParticipants[i]) {
                continue;
            }
            newAddedParticipants.push(addedParticipants[i]);
        }

        setAddedParticipants(newAddedParticipants);
    });

    let suggestedParticipantClicked = ((event) => {

        // Maximum number of participants have already been added
        if (addedParticipants.length >= 5) {
            return;
        }

        const newParticipant = event.target.getAttribute('value');

        let newParticipantAlreadyExists = false;

        const len = addedParticipants.length;
        for (let i = 0; i < len; ++i) {

            // If the new participant is a duplicate addition
            if (addedParticipants[i] == newParticipant) {
                newParticipantAlreadyExists = true;
                break;
            }
        }

        // If the new participant is not a duplicate addition
        if (!newParticipantAlreadyExists) {
            const newAddedParticipants = [...addedParticipants, newParticipant];
            setAddedParticipants(newAddedParticipants);
        }

        setSuggestedParticipants([]);
    });

    return (
        <div className='h-screen w-screen flex justify-center items-center fixed'
            id="createGroupChatPopUpOverlay"
            onClick={closeGroupChatPopUp}>
                
            <div className='createGroupChatPopUp min-h-[300px] min-w-[600px] flex flex-col items-center border-black border-2'>

                <div className='createGroupChatPopUpHeader flex flex-row'>
                    <div className='createGroupChatPopUpTitle text-4xl font-medium text-center mt-[5px] mb-[5px]'>Create new group chat</div>
                </div>

                <input className='groupChatName w-[80%] text-[20px] px-2 mt-[10px] rounded-lg' id="groupChatName" placeholder='Group name'></input>
                <input
                    className='groupChatParticipants w-[80%] text-[20px] font-normal mt-[10px] px-2 rounded-lg'
                    id='groupChatParticipants'
                    placeholder='Add participants here'
                    onChange={searchForUsers}>
                </input>

                <div className='suggestedParticipants w-[80%]'>
                    {
                        suggestedParticipants.map( (participant) =>
                            <div className='suggestedParticipant text-[20px] width-[100%] bg-white mt-[0.5px] px-[4px] hover:cursor-pointer border-[1px] border-black border-1'
                                key={participant.username}
                                value={participant.username}
                                onClick={suggestedParticipantClicked}>
                                    {participant.username}
                            </div>
                        )
                    }
                </div>

                <div className='addedParticipants w-[80%] text-center'>
                    {
                        addedParticipants.map( (participant) =>
                            <button
                                className='addedParticipantName inline-flex text-[20px] px-[4px] mt-[7px] mx-[10px] hover:scale-[1.04] active:scale-[1] rounded-[8px] border-[1px] border-black'
                                id='addedParticipantName'
                                onClick={removeAddedParticipant}
                                value={participant}>
                                    {participant}
                            </button>
                        )
                    }
                </div>

                <button
                    className='createGroupChatSubmitButton text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-md px-5 py-2.5 mt-[8px] hover:scale-[1.04] active:scale-[1]'
                    onClick={createButtonClicked}>
                        Create
                </button>

                <div className='participantsNumberMessage font-medium text-[18px] mx-[3px] my-[4px] italic'>
                    *Atmost 5 people can be a part of a group chat*
                </div>

            </div>
        </div>
    );
}