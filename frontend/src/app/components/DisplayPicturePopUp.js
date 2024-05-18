import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import './styles/DisplayPicturePopUp.css';
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";
import { useUsernameStore } from "../../../zustand/useUsernameStore";

export default function DisplayPicturePopUp(props) {

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
        formData.append("name", props.name);
        formData.append("previousDisplayPicture", props.displayPicture);
        formData.append("newDisplayPicture", props.name + `.${fileExtension}`);
        formData.append("image", file);

        try {
            const response = await axios.post('http://localhost:8080/chats/updateDisplayPictureOfChat',
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
            const response = await axios.post('http://localhost:8080/chats/removeDisplayPictureOfChat',
            {
                name: props.name
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
            const response = await axios.post('http://localhost:8080/auth/logout',
            {},
            {
              withCredentials: true
            });
            window.location.reload();
            router.replace('/');
        }
        catch(error) {
            // Jwt token expired, the user needs to login again
            router.replace('/');
        }
    });

    return (
        <div className='h-screen w-screen min-h-[700px] min-w-[650px] flex flex-col justify-center items-center fixed'
            id="displayPicturePopUpOverlay"
            onClick={closePopUpDisplayPicture}>

                <div className="text-[30px] mb-[10px]" id="name">
                    {props.name}
                </div>

                <img
                    className="displayPicture h-[450px] w-[450px] min-h-[450px] min-w-[450px] rounded-full border-white border-[2px]"
                    src={`https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/${props.displayPicture}`}>
                </img>

                {
                    props.canChangeDisplayPicture == 'true' ?
                    <div className="buttons flex flex-row">
                        <button
                            className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-[20px] px-5 py-2.5 mt-[20px] mr-[10px] hover:scale-[1.04] active:scale-[1]"
                            id="changeDisplayPictureButton"
                            onClick={changeDisplayPictureButtonClicked}>
                                Change display picture
                        </button>

                        {
                            props.displayPicture != 'default.jpg' ?
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
                    props.name == username ?
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