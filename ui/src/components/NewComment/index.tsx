import React, { useState } from 'react';

const NewComment = ({ id }) => {
    const [comment, setComment] = useState("");

    const postComment = async (event) => {
        event.preventDefault();
        const user = localStorage.getItem('message-user');
        const url = 'http://localhost:7777/comment';

        const payload = {
            id,
            comment,
            user
        }

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        setComment("");
        
    }

    return (
        <form
            className='flex justify-between '
            onSubmit={async (e) => await postComment(e)}
        >
            <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className='w-full border '>

            </textarea>
            <button
                type='submit'
                className='border bg-blue-400 h-min p-3 rounded'
            >
                Comment
            </button>
        </form>
    );
}

export default NewComment;