import React, { useState } from 'react';

const NewMessage = () => {
    const [message, setMessage] = useState("");

    const onSubmit = (event) => {
        event.preventDefault();
        const user = localStorage.getItem('message-user');
        const url = 'http://localhost:7777/message';

        const payload = {
            message,
            user,          
        }

        // Send request
        fetch(url, {
            method: "POST",
            body: JSON.stringify(payload)
        })

        console.log(message, user);
    }

    return (
        <form
            className="flex justify-between"
            onSubmit={onSubmit}
        >
            <textarea
                className='w-full border'
                onChange={(e) => setMessage(e.target.value)}
            >

            </textarea>
            <button
                type="submit"
                className='border bg-blue-400 hover:bg-blue-500 h-min p-3 rounded text-white text-bold text-lg'
            >
                SEND MESSAGE
            </button>
        </form>
    );
}

export default NewMessage;