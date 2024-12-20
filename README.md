# Project

This project consists of two main parts:
1. **Server** - Hosts the website and API.
2. **Site** - The frontend application available through a web browser.

## Running the Server

To run the server, use either `npm start` or `node src/server.js`.

### Steps to run the server:

1. Navigate to the server directory:
   ```bash
   cd {current project directory}/server
Install dependencies:

bash

npm install
Start the server:

bash

npm start
Or:

bash

node src/server.js
The server will listen on the configured port and host the website.

Project Structure
php

project/

│

├── server/                 # Server directory

│   ├── src/                # Server source code

│   │   └── server.js       # Server entry point

│   ├── package.json        # Server configuration

│   └── ...                 # Other server files

│

└── site/                   # Site (frontend) directory

    ├── dist/             # Static files for the site
    
    ├── package.json        # Frontend configuration
    
    └── ...                 # Other frontend files
    
Installing Dependencies for Server and Site
Server:
Navigate to the server directory and run:

bash

npm install

Site:
Navigate to the site directory and run:

bash

npm install

Notes
Make sure all necessary dependencies are installed.
Configure settings for database or other services if required.

License
This project is licensed under the Creative Commons Zero v1.0 Universal (CC0 1.0) Public Domain Dedication. This means you can copy, modify, distribute, and perform the work, even for commercial purposes, without asking for permission.

