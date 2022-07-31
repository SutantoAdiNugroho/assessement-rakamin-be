## Simple Chat Application

A simple rest api used to chat services.

### How run the apps :

#### 1. Clone the repository
```
$ git clone https://github.com/SutantoAdiNugroho/assessment-rakamin-be.git
```
#### 2. Install dependencies
```
$ cd assessment-rakamin-be
```
and then run
```
$ npm install
```

#### 3. Configure .env file on the project
There is already a sample env file, and all the keywords from the env file must be filled in.

| Keywords        | Description                      |
| ----------------|----------------------------------|
| DB_HOST         | PostgreSQL host connection       |
| DB_USERNAME     | Username connection              |
| DB_PASSWORD     | Password connection              |
| DB_NAME         | Name of database                 |
| JWT_SECRET_KEY  | Key for build and sync JWT token |
| ENV             | Name of project environment, default example will be `development` |
| PORT            | Port to run the apps             |

If we want to install PostgreSQL by local, we can reach at [here.](https://medium.com/@dan.chiniara/installing-postgresql-for-windows-7ec8145698e3)

#### 4. Launch the apps by locally
```
$ npm run dev
```

### Documentation API
if we want to identify the application based on API documentation, we can react at this endpoint `http://localhost:3000/docs`
