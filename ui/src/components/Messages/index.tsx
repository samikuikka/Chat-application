import React, { useEffect, useState } from 'react';
import Message from '../Message';
import NewMessage from '../NewMessage';
import { v4 } from 'uuid';


const Messages = () => {
    const [ messages, setMessages] = useState([]);

    // Addd user
    const user = localStorage.getItem('message-user');
    if(!user) {
        localStorage.setItem('message-user', v4());
    }

    useEffect(() => {
        console.log('Attempting to connect to the websocket');
        
        const ws = new WebSocket('ws://localhost:7777/connect');
        ws.onopen = () => {
            console.log('Connection established');
            ws.send('Connected!')
        }
        ws.onerror = (e) => console.log('Web socket error: ', e);
        ws.onmessage = (event) => {
            //console.log('new message:', event);
            const new_messages = event.data;
            if(new_messages) {
                setMessages(JSON.parse(new_messages));
            }
        }

    }, []);

    
    return (
        <div
          className='w-full px-14 flex justify-center'
        >
            <div
                className='flex flex-col max-w-md '
            >
                <NewMessage />
                {messages.map(message => <Message data={message} />)}
                <div className=' text-right pb-2'>
                    {"messages: " +messages.length + '/20'}
                </div>
            </div>
        </div>
    );
}

export default Messages;