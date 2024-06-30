import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import './styles/DisplayPicturePopUp.css';
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";

export default function DisplayPicturePopUp({name, displayPicture, canChangeDisplayPicture, participants, clearState}) {

    const {setPopUpDisplayPicture} = usePopUpDisplayPictureStore();
    const {username} = useUsernameStore();
    const router = useRouter();

    let closePopUpDisplayPicture = ((event) => {

        if (event.target.id != 'displayPicturePopUpOverlay') {
            return;
        }
        setPopUpDisplayPicture(null);
    });

    let newDisplayPictureSelected = (async(event) => {

        const fileList = event.target.files;

        // No file is selected
        if (fileList.length == 0) {
            return;
        }

        // Selecting the first image (in case a list is selected)
        const file = fileList[0];
        const splitArr = file.name.split('.');
        const fileExtension = splitArr[splitArr.length - 1];

        const formData = new FormData();
        formData.append("name", name);
        formData.append("previousDisplayPicture", displayPicture);
        formData.append("newDisplayPicture", name + `.${fileExtension}`);
        formData.append("image", file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/updateDisplayPictureOfChat`,
            formData,
            {
              withCredentials: true
            });
            window.location.reload();
        }
        catch(error) {
            // Jwt token expired, the user needs to login again
            router.replace('/');
        }
    });

    let changeDisplayPictureButtonClicked = (async(event) => {
        const hiddenInputTag = document.getElementById('selectDisplayPictureTag');
        // Clicking the hidden input tag to choose a new display picture
        hiddenInputTag.click();
    });

    let removeDisplayPictureButtonClicked = (async(event) => {

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/removeDisplayPictureOfChat`,
            {
                name: name
            },
            {
              withCredentials: true
            });
            window.location.reload();
        }
        catch(error) {
            // Jwt token expired, the user needs to login again
            router.replace('/');
        }
    });

    let logoutButtonClicked = (async(req, res) => {
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
            router.replace('/');
        }
    });

    return (
        <div className='h-full w-full min-h-[700px] min-w-[850px] flex flex-col justify-center items-center absolute top-0 bottom-0 left-0 right-0'
            id="displayPicturePopUpOverlay"
            onClick={closePopUpDisplayPicture}>

                <div className="text-[30px]" id="name">
                    {name}
                </div>

                <div className="text-[25px] mb-[5px]" id="name">
                    {participants}
                </div>

                <img
                    className="displayPicture h-[450px] w-[450px] min-h-[450px] min-w-[450px] rounded-full border-white border-[2px]"
                    src={`https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${displayPicture}`}>
                </img>

                {
                    canChangeDisplayPicture == 'true' ?
                    <div className="buttons flex flex-row">
                        <button
                            className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-[20px] px-5 py-2.5 mt-[20px] mr-[10px] hover:scale-[1.04] active:scale-[1]"
                            id="changeDisplayPictureButton"
                            onClick={changeDisplayPictureButtonClicked}>
                                Change display picture
                        </button>

                        {
                            displayPicture != 'default.jpg' ?
                            <button
                                className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-[20px] px-5 py-2.5 mt-[20px] ml-[10px] hover:scale-[1.04] active:scale-[1]"
                                id="removeDisplayPictureButton"
                                onClick={removeDisplayPictureButtonClicked}>
                                    Remove display picture
                            </button> :
                            <></>
                        }
                    </div> :
                    <></>
                }

                {
                    name == username ?
                    <button
                        className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-[20px] px-5 py-2.5 mt-[20px] hover:scale-[1.05] active:scale-[1]"
                        id="logoutButton"
                        onClick={logoutButtonClicked}>
                            Logout
                    </button> :
                    <></>
                }

                <input hidden id="selectDisplayPictureTag" type="file" accept="image/png, image/jpeg" onChange={newDisplayPictureSelected} />
        </div>
    );
}