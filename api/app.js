import { serve } from "./deps.js";
import postgres from "https://deno.land/x/postgresjs@v3.3.2/mod.js";

// Config
const PGPASS = Deno.env.get("PGPASS").trim();
const PGPASS_PARTS = PGPASS.split(":");

const host = PGPASS_PARTS[0];
const port = PGPASS_PARTS[1];
const database = PGPASS_PARTS[2];
const username = PGPASS_PARTS[3];
const password = PGPASS_PARTS[4];

const sql = postgres({
    host, port, database, username, password
});


const sockets = new Set();

// Creates web socket connection
const createWebSocketConnection = async (request) => {
    //console.log('Crating WS connection...');
    const { socket, response } = Deno.upgradeWebSocket(request);

    // When connection is opened, we can send the messages to the client
    socket.onopen = async () => {
        const rows = await getMessages()
        try {
            socket.send(JSON.stringify(rows));
        } catch (e) {
            
        }
    }

    // For debugging
    socket.onerror = (e) => {
        //console.log('WS ERROR: ', e);
    }

    socket.onmessage = (e) => console.log(`Received a message: ${e.data}`);
    socket.onclose = () => {
        sockets.delete(socket)
    }
    

    sockets.add(socket);
    return response;
}

//Get 20 most recent messages from db
const getMessages = async () => {

    const result = await sql`SELECT id, time, username, message, ARRAY_AGG( commenter  || '#comment#' || comment ) comments FROM messages LEFT OUTER JOIN comments ON id = message_id GROUP BY id ORDER BY time DESC  LIMIT 20`
    
    const rows = result.map( (row) => {

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
    const time = new Date();

    await sql`
        INSERT INTO messages
        (username, time,  message)
        VALUES
        (${user}, ${time}, ${message})
    `
    
    const rows = await getMessages();
    
    return rows;
}

// Add new comment
const addComment = async ({id, comment, user}) => {

    await sql`
        INSERT INTO comments
        (comment, message_id, commenter )
        VALUES
        (${comment}, ${id}, ${user})
    `

    return;
}

const handleRequest = async (request) => {
    const url = new URL(request.url);

    
    if(url.pathname === "/connect") {
        return await createWebSocketConnection(request);
    } else if(request.method === "POST" && url.pathname === "/message") {
        const data = await request.json();
  
        sockets.forEach( socket => {
            if(socket.readyState === 3) {
                sockets.delete(socket);
            }
        })
        // Update the view
        const rows = await addMessage(data);
        sockets.forEach( (socket) => {

            if(socket.readyState == 1) {
                try {
                    socket.send(JSON.stringify(rows))
                } catch (e) {
                }
                
            }
        });
        return new Response('ADDED MESSAGE', { status: 201 })
    } else if (request.method === "POST" && url.pathname === "/comment") {

        const data = await request.json();
        
        // Send new comment
        await addComment(data);

        // Update the view
        const rows = await getMessages();
        sockets.forEach( (socket) => {
            
            if(socket.readyState == 1) {
                try {
                    socket.send(JSON.stringify(rows))
                } catch (e) {
                    
                }
            }
        });
        return new Response('ADDED COMMENT', { status: 201 })
    }

    return new Response('DEFAULT', { status: 200 })
}

serve(handleRequest, { port: 7777 });