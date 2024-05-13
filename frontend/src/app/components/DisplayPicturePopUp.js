import React from "react";
import axios from "axios";
import './styles/DisplayPicturePopUp.css';
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";

export default function DisplayPicturePopUp({canChangeProfilePicture}) {

    const {setPopUpDisplayPicture} = usePopUpDisplayPictureStore();

    let closePopUpDisplayPicture = ((event) => {

        if (event.target.id != 'displayPicturePopUpOverlay') {
            return;
        }
        setPopUpDisplayPicture(null);
    });

    return (
        <div className='h-screen w-screen flex flex-col justify-center items-center fixed'
            id="displayPicturePopUpOverlay"
            onClick={closePopUpDisplayPicture}>
                <div className="displayPictureDiv">
                    <img
                        className="displayPicture h-[450px] w-[450px] rounded-full border-white border-[2px]"
                        src="https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/anish.png">
                    </img>
                </div>

                {
                    canChangeProfilePicture ?
                        <button>Change</button> :
                        <></>
                }
        </div>
    );
}