import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCreateGroupChatStore } from "../../../zustand/useCreateGroupChatStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";
import { useSocketStore } from "../../../zustand/useSocketStore";
import './styles/CreateGroupChatPopUp.css';

export default function CreateGroupChatPopUp({chatNameToDisplayPictureMap}) {

    const [suggestedParticipants, setSuggestedParticipants] = useState([]);
    const [addedParticipants, setAddedParticipants] = useState([]);
    const {createGroupChat, setCreateGroupChat} = useCreateGroupChatStore();
    const {username} = useUsernameStore();
    const {socket, setSocket} = useSocketStore();
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
                participants: [username, ...addedParticipants]
            },
            {
                withCredentials: true
            });

            socket.emit('groupChatCreated', {
                participants: [username, ...addedParticipants]
            });

            alert('Group chat successfully created!');
            window.location.reload();
            setCreateGroupChat(false);
        }
        catch(error) {
            // Jwt token expired, the user needs to login again
            alert(error.response.data.message);
            router.replace('/');
        }
    });

    let removeAddedParticipant = ((participant) => {
        
        let newAddedParticipants = [];
        for (let i = 0; i < addedParticipants.length; ++i) {

            if (participant === addedParticipants[i]) {
                continue;
            }
            newAddedParticipants.push(addedParticipants[i]);
        }

        setAddedParticipants(newAddedParticipants);
    });

    const checkboxClicked = ((event) => {
        const participantName = event.target.getAttribute('participant-name');

        const checked = event.target.checked;

        if (checked) {
            suggestedParticipantClicked(participantName);
        }
        else {
            removeAddedParticipant(participantName);
        }
    });

    let suggestedParticipantClicked = ((newParticipant) => {

        // Maximum number of participants have already been added
        if (addedParticipants.length >= 5) {
            return;
        }

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
    });

    return (
        <div className='h-screen w-screen flex justify-center items-center fixed'
            id="createGroupChatPopUpOverlay"
            onClick={closeGroupChatPopUp}>
                
            <div className='createGroupChatPopUp h-[80%] max-h-[600px] min-w-[600px] max-w-[600px] flex flex-col items-center border-black border-[2px] rounded-[5px]'>

                <div className='createGroupChatPopUpHeader flex flex-row'>
                    <div className='createGroupChatPopUpTitle text-4xl font-medium text-center mt-[10px] mb-[5px]'>Create new group chat</div>
                </div>

                <input className='groupChatName w-[80%] text-[21px] px-2 py-[2px] mt-[10px] rounded-[5px] border-black border-[1px]'
                    id="groupChatName" placeholder='Group name'></input>

                <div className='suggestedParticipants h-[500px] w-[80%] mt-[8px] border-black border-[1px] overflow-y-auto'
                    id="suggestedParticipants">
                    <input
                        className='groupChatParticipants w-full text-[21px] font-normal px-2 py-[2px] border-black border-b-[1px]'
                        id='groupChatParticipants'
                        placeholder='Search for participants here'
                        onChange={searchForUsers}>
                    </input>
                    {
                        suggestedParticipants.map((participant, index) =>
                        (
                            <div className="suggestedParticipant h-[65px] flex flex-row border-black border-b-[1px]"
                                key={`suggestedParticipant-${index}`}>
                                <div className="suggestedParticipantDisplayPictureDiv w-[70px] flex justify-center items-center"
                                    key={`suggestedParticipantDisplayPictureDiv-${index}`}>
                                    <img className="suggestedParticipantDisplayPicture h-[55px] w-[55px] rounded-full border-black border-[1px]"
                                        src={`https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${chatNameToDisplayPictureMap[participant.username]}`}
                                        key={`suggestedParticipantDisplayPicture-${index}`}>
                                    </img>
                                </div>

                                <div className="participantName flex items-center flex-grow text-[22px] font-[400] pl-[5px] truncate ...">{participant.username}</div>

                                <div className="selectDiv w-[50px] flex justify-center items-center">
                                    <input className="checkbox h-[19px] w-[19px]" type="checkbox" onChange={checkboxClicked}
                                        participant-name={participant.username} checked={addedParticipants.includes(participant.username)}></input>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className='addedParticipants w-[80%] text-center my-[3px]'>
                    {
                        addedParticipants.map((participant) =>
                            <div
                                className='addedParticipantName inline-flex text-[18px] px-[5px] py-[3px] mt-[7px] mx-[10px] rounded-[8px] border-[1px] border-black'
                                id='addedParticipantName' key={participant}>
                                    {participant}
                            </div>
                        )
                    }
                </div>

                <button
                    className='createGroupChatSubmitButton text-white bg-green-500 hover:bg-green-600 font-medium rounded-lg text-[16px] px-[20px] py-[10px] mt-[8px] hover:scale-[1.04] active:scale-[1]'
                    onClick={createButtonClicked}>
                        Create
                </button>

                <div className='participantsNumberMessage font-medium text-[18px] mx-[3px] mt-[4px] mb-[10px] italic'>
                    *Atmost 5 people can be a part of a group chat*
                </div>

            </div>
        </div>
    );
}