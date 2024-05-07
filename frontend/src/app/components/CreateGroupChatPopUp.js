import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import '../styles/CreateGroupChatPopUp.css';
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";

export default function CreateGroupChatPopUp() {

    const [suggestedParticipants, setSuggestedParticipants] = useState([]);
    const [addedParticipants, setAddedParticipants] = useState([]);
    const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
    const router = useRouter();

    let closeGroupChatPopUp = ((event) => {

        if (event.target.className != 'create-group-chat-pop-up-overlay') {
            return;
        }
        setCreateGroupChat(false);
    });

    let searchForUsers = (async () => {
        const searchString = document.getElementsByClassName('group-chat-participants')[0].value;
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

        const groupChatName = document.getElementsByClassName('group-chat-name')[0].value;

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
        <div className='create-group-chat-pop-up-overlay' onClick={closeGroupChatPopUp}>
            <div className='create-group-chat-pop-up'>

                <div className='create-group-chat-pop-up-header'>
                    <div className='create-group-chat-pop-up-title'>Create new group chat</div>
                </div>

                <input className='group-chat-name' placeholder='Group name'></input>
                <input
                    className='group-chat-participants'
                    placeholder='Add participants here'
                    onChange={searchForUsers}>
                </input>

                <div className='suggested-participants-box'>
                    <div className='suggested-participants'>
                        {
                            suggestedParticipants.map( (participant) =>
                                <div className='suggested-participant' key={participant.username}
                                    value={participant.username}
                                    onClick={suggestedParticipantClicked}>
                                        {participant.username}
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className='added-participants'>
                    {
                        addedParticipants.map( (participant) =>
                            <div className='added-participant' key={participant} onClick={removeAddedParticipant}>
                                <div className='added-participant-name' value={participant}>
                                    {participant}
                                </div>
                            </div>
                        )
                    }
                </div>

                <button className='create-group-chat-submit-button' onClick={createButtonClicked}>
                    Create
                </button>
                <div className='participants-number-message'>
                    Atmost 5 people can be a part of a group chat
                </div>

            </div>
        </div>
    );
}