# CSCI 3308 Final Project: CUShares Website
> Authors and contributors: Cameron Foppe, Connor Smith, Dax Roy, Neena Parikh, Noah Liska, and Patrick Nguyen

Our website allows students at University of Colorado Boulder to share and view projects of like minded individuals and create connections through these projects. We offer a way to post your projects, message with fellow students, and join groups that interest you!

## Tech Stack

- VCS Repository: GitHub
- Database: PostgreSQL
- UI Tools: HTML5, Handlebars
- Application server, framework, and API service: NodeJS
- Local deployment environment: Docker
- Testing tool: Mocha
- Cloud deployment environment: Microsoft Azure

## Software Necessary to Run on Local Server

- Docker 
- Access to local browser

## Steps to Access Website
Open Docker/terminal environment
In source directory:
```bash
cd ./ProjectSourceCode
docker compose up -d #-d flag is optional
```
Verify all tests are passing (All tests will run automatically on container initialization, verify in web-1 container log) \
Access website on [localhost](https://localhost:3000) \
Enjoy!
