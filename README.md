# Chat application

Fullstack chat application (sending messages and seeing comments on messages), with load balancing and scaling with Kubernetes.
WebSocket implementation between frontend and backend.


## Tech stack

### Backend:

 - Deno
 -  PostgreSQL

### Frontend:
 

 - Astro
 - React
 - Tailwind

### Other:

 - Docker for running the application
 - Kubernetes for scaling
 - k6 for load testing the application
 - Flyway for database migration.

## Running the application

Project contains docker-compose file that can be used to start the application, e.g.,

    docker-compose up --build

