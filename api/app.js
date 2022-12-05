import { serve } from "./deps.js";
import { executeQuery } from './database.js';


const sockets = new Set();

// Creates web socket connection
const createWebSocketConnection = async (request) => {
    console.log('Crating WS connection...');
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.onopen = async () => {
        console.log('Conntection created');
        const rows = await getMessages()
        socket.send(JSON.stringify(rows));
    }
    socket.onmessage = (e) => console.log(`Received a message: ${e.data}`);
    socket.onclose = () => {
        console.log('WS closed');
        sockets.delete(socket)
    }
    socket.onerror = (e) => console.error('WS error', e);
    socket.onclose = () => console.log('connection closed');

    sockets.add(socket);
    //console.log('1:', sockets)
    return response;
}

//Get 20 message from db
const getMessages = async () => {
    const result = await executeQuery(
        "SELECT id, time, username, message, ARRAY_AGG( commenter  || '#comment#' || comment ) comments FROM messages LEFT OUTER JOIN comments ON id = message_id GROUP BY id ORDER BY time DESC  LIMIT 20"
    )
    
    const rows = result.rows.map( (row) => {

    const comments = []
    row.comments.forEach( (comment) => {
        // Check that comment not null
        if(comment) {
            const split = comment.split("#comment#");
            comments.push({username: split[0], comment: split[1]});
        }
    })


    return {
            id: row.id.toString(),
            time: new Date(row.time),
            username: row.username,
            message: row.message,
            comments: comments
        }
    });

    return rows;
}

// Adds new message to the db
const addMessage = async ({user, message}) => {
    
    await executeQuery(
        "INSERT INTO messages (username, time,  message) VALUES ($user, $time, $message);",
        {
            user,
            time: new Date(),
            message
        }
    );

    const rows = await getMessages();
    
    return rows;
}

// Add new comment
const addComment = async ({id, comment, user}) => {

    await executeQuery(
        "INSERT INTO comments (comment, message_id, commenter ) VALUES ($comment, $id, $user);", {
            comment,
            id,
            user
        }
    );
    return;
}

const handleRequest = async (request) => {
    const url = new URL(request.url);

    //console.log(url.pathname)
    //return new Response("hello world", { status: 200});
    if(url.pathname === "/connect") {
        return await createWebSocketConnection(request);
    } else if(request.method === "POST" && url.pathname === "/message") {
        const data = await request.json();
        
        // Update the view
        const rows = await addMessage(data);
        sockets.forEach( (socket) => socket.send(JSON.stringify(rows)));
    } else if (request.method === "POST" && url.pathname === "/comment") {

        const data = await request.json();
        
        // Send new comment
        await addComment(data);

        // Update the view
        const rows = await getMessages();
        sockets.forEach( (socket) => socket.send(JSON.stringify(rows)));
    }

    return new Response('DEFAULT', { status: 200 })
}

serve(handleRequest, { port: 7777 });