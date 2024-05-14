import React from "react";
import axios from "axios";
import './styles/DisplayPicturePopUp.css';
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";

export default function DisplayPicturePopUp(props) {

    const {setPopUpDisplayPicture} = usePopUpDisplayPictureStore();

    let closePopUpDisplayPicture = ((event) => {

        if (event.target.id != 'displayPicturePopUpOverlay') {
            return;
        }
        setPopUpDisplayPicture(null);
    });

    return (
        <div className='h-screen w-screen min-h-[700px] min-w-[650px] flex flex-col justify-center items-center fixed'
            id="displayPicturePopUpOverlay"
            onClick={closePopUpDisplayPicture}>
                <img
                    className="displayPicture h-[450px] w-[450px] min-h-[450px] min-w-[450px] rounded-full border-white border-[2px]"
                    src="https://chat-application-display-pictures-bucket.s3.ap-south-1.amazonaws.com/anish.png">
                </img>

                {
                    props.canChangeDisplayPicture == 'true' ?
                    <button
                        className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-[20px] px-5 py-2.5 mt-[20px] hover:scale-[1.04] active:scale-[1]"
                        id="changeDisplayPictureButton">
                            Change display picture
                    </button> :
                        <></>
                }
        </div>
    );
}