import React, { useState } from 'react';
import Comment from '../Comment';
import NewComment from '../NewComment';

const Message = ({ data }) => {
    const [open, setOpen] = useState(false);


    return (
        <div
            className='w-full self-center py-3 px-2 mb-4 border shadow-lg flex flex-col'
        >
            <div
                className='text-xs pb-1'
            >
                {new Date(data.time).toUTCString()}
            </div>
            <div
                className='flex justify-between'
            >
                {data.message + ` ~ ${data.username}`}
                <button
                    onClick={() => setOpen(!open)}
                >
                    {
                        !open ?
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                    }
                </button>
            </div>

            {
                    open && 
                    <div>
                        <div className='w-full border my-2 px-2'> </div>
                        <h2>Comments:</h2>
                        
                        {data.comments.map(comment => {
                            return <Comment data={comment} />
                        })}
                        <NewComment id={data.id} />

                    </div>
            }

        </div>
    )
}

export default Message;