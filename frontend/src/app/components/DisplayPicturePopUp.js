import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import './styles/DisplayPicturePopUp.css';
import { usePopUpDisplayPictureStore } from "../../../zustand/usePopUpDisplayPictureStore";

export default function DisplayPicturePopUp(props) {

    const {setPopUpDisplayPicture} = usePopUpDisplayPictureStore();
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
        formData.append("imageName", props.name + `.${fileExtension}`);
        formData.append("image", file);

        try {
            const response = await axios.post('http://localhost:8080/chats/updateDisplayPictureOfChat',
            formData,
            {
              withCredentials: true
            });
            console.log(response);
          }
          catch(error) {
            // Jwt token expired, the user needs to login again
            alert(error.response.data.message);
            router.replace('/');
          }
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

                <input type="file" accept="image/png, image/jpeg" name="image" onChange={newDisplayPictureSelected} />
        </div>
    );
}