import React from 'react';

interface CommentProps {
    data: {
        comment: string;
        username: string | number;
    }
}

const Comment: React.FC<CommentProps> = ({data}) => {
    
    return (
        <div
            className='p-2 my-3 border border-gray-300 '
        >
            {data.comment + ` ~ ${data.username}`}
        </div>
    );
}

export default Comment;