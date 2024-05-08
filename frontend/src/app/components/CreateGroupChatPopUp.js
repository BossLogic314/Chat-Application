import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import './styles/CreateGroupChatPopUp.css';
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";

export default function CreateGroupChatPopUp() {

    const [suggestedParticipants, setSuggestedParticipants] = useState([]);
    const [addedParticipants, setAddedParticipants] = useState([]);
    const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
    const router = useRouter();

    let closeGroupChatPopUp = ((event) => {

        if (event.target.id != 'createGroupChatPopUpOverlay') {
            return;
        }
        setCreateGroupChat(false);
    });

    let searchForUsers = (async () => {
        const searchString = document.getElementsByClassName('groupChatParticipants')[0].value;
        if (searchString !== '') {
            try {
                const response = await axios.get(`http://localhost:8080/users/getUsers?searchString=${searchString}`,
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

        const groupChatName = document.getElementsByClassName('groupChatName')[0].value;

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
        <div className='h-screen w-screen flex justify-center items-center'
            id="createGroupChatPopUpOverlay"
            onClick={closeGroupChatPopUp}>
                
            <div className='createGroupChatPopUp h-[300px] w-[600px] flex flex-col items-center border-black border-2'>

                <div className='createGroupChatPopUpHeader flex flex-row h-[15%]'>
                    <div className='createGroupChatPopUpTitle text-3xl text-center w-[90%]'>Create new group chat</div>
                </div>

                <input className='groupChatName' placeholder='Group name'></input>
                <input
                    className='groupChatParticipants'
                    placeholder='Add participants here'
                    onChange={searchForUsers}>
                </input>

                <div className='suggestedParticipantsBox'>
                    <div className='suggestedParticipants'>
                        {
                            suggestedParticipants.map( (participant) =>
                                <div className='suggestedParticipant' key={participant.username}
                                    value={participant.username}
                                    onClick={suggestedParticipantClicked}>
                                        {participant.username}
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className='addedParticipants'>
                    {
                        addedParticipants.map( (participant) =>
                            <div className='addedParticipant' key={participant} onClick={removeAddedParticipant}>
                                <div className='addedParticipantName' value={participant}>
                                    {participant}
                                </div>
                            </div>
                        )
                    }
                </div>

                <button className='createGroupChatSubmitButton' onClick={createButtonClicked}>
                    Create
                </button>
                <div className='participantsNumberMessage text-[18px] mt-[5px]'>
                    Atmost 5 people can be a part of a group chat
                </div>

            </div>
        </div>
    );
}