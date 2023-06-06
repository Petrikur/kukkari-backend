


# Kukkari Express app
Welcome to the Kukkari Website project! This project is Express app which works as the backend side of the kukkari project. 

Project is aimed at providing an online platform for my family members to reserve the cabin, write and view notes about cabin stuff and comment on them, view a gallery of photos, and more.

Project is currently in development and link to live project will come later.

## Features
Here are some of the features available in this application:

Reserve Cabin: Users can easily view the calendar and make reservation or cancel reservation on the cabin for a specific date range.

Notes: Users can create and view notes about anything related to the cabin. Additionally, they can also comment on notes to engage in discussions with other users.

Gallery: Users can view a gallery of photos of the cabin, including both interior and exterior shots and also upload new images which are stored in AWS S3.

Own account page: Users can change password, see their reservations etc. And opt in for notifications if someone creates new reservation etc.

More coming...

## API endpoints

### Notes

| Request     | Endpoint      | Purpose   |                   
| -------------| ------------- | -------- |                   
| GET          | /api/notes         | Get all notes  |
| GET         | /api/notes/:pid | Get note by id    |
  POST         | /api/notes/newnote         | Create new note 
PATCH            |/api/notes/:pid  |  Update note
DELETE       | /api/notes/:pid  | Delete note 

### Users

| Request     | Endpoint      | Purpose   |                   
| -------------| ------------- | -------- |                   
| GET          | /api/users         | Get all users  |
| GET         | /api/users/:uid | Get user by user id    |
  POST         | /api/users/login         | User Login
POST            |/api/users/signup  |  User Signup

### Reservations

| Request     | Endpoint      | Purpose   |                   
| -------------| ------------- | -------- |                   
| GET          | /api/reservations         | Get all reservations  |
| POST         | /api/reservations  | Create new reservation   |
DELETE         | /api/reservations/:pid         | Delete reservation

### Comments

| Request     | Endpoint      | Purpose   |                   
| -------------| ------------- | -------- |                   
| POST          | /api/comments            |Create new comment  |
| GET         | /api/notes/:id/comments  | Get comments by note id  |
DELETE         | /api/comments/:pid          | Delete comment from note


## Getting Started
To get started with this project, follow these steps:

Clone this repository onto your local machine.

Install the required dependencies using npm or yarn:

### Run the development server:
```bash
npm install 
npm start
```
Open your web browser and navigate to http://localhost:5000.

## Contributing
If you would like to contribute to this project, please follow these steps:

Fork this repository onto your own GitHub account.

Clone the forked repository onto your local machine.

Create a new branch for your changes:
```bash
git checkout -b my-new-feature
```
Make your changes and commit them to your local branch.

Push your changes to your forked repository:
```bash
git push origin my-new-feature
```
Create a new pull request on the original repository, describing your changes in detail.
## License
This project is licensed under the MIT License 