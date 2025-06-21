# News API Backend

A robust and scalable backend for a news application, built with Express.js and TypeScript. It supports creating, reading, updating, and deleting articles, associating them with tags and categories, and handling video and image uploads.

## Features

- **RESTful API:** Endpoints for managing articles, tags, and categories.
- **Database:** PostgreSQL with Sequelize ORM for structured data storage.
- **Object Storage:** S3-compatible storage (MinIO for local development, easily switchable to AWS S3/Google Cloud Storage for production) for efficient storage of video and image files.
- **TypeScript:** Type-safe development for improved maintainability and developer experience.
- **Asynchronous Error Handling:** Centralized error management using custom exceptions and `asyncHandler` middleware.

## Getting Started

Follow these steps to get the News API Backend up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js (LTS recommended):** [Download & Install Node.js](https://nodejs.org/en/download/)
- **npm:** Node.js package manager (comes with Node.js).
- **Docker Desktop:** Essential for running PostgreSQL and MinIO locally in isolated containers.
  - [Download & Install Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download & Install Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
  - [Download & Install Docker Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/)
  - Ensure Docker Desktop is running before proceeding with the database and storage setup. You should see the Docker whale icon in your menu bar.

### Local Development Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/AxelBlaz3/news-api-backend.git
    cd news-api-backend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Database Setup (PostgreSQL with Docker)**

    We'll use Docker to run a PostgreSQL database container.

    - **Pull the PostgreSQL image:**
      ```bash
      docker pull postgres
      ```
    - **Run the PostgreSQL container:**

      ```bash
      docker run --name news-postgres-db \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=mysecretpassword \
        -p 5432:5432 \
        -v pgdata:/var/lib/postgresql/data \
        -d postgres
      ```

      **Explanation:**

      - `--name news-postgres-db`: Assigns a name to your container.
      - `-e POSTGRES_USER=postgres`: Sets the default PostgreSQL superuser to `postgres`.
      - `-e POSTGRES_PASSWORD=mysecretpassword`: **Set a strong, unique password here.** This will be the password for the `postgres` user.
      - `-p 5432:5432`: Maps port 5432 on your host machine to port 5432 inside the container, allowing your app to connect via `localhost:5432`.
      - `-v pgdata:/var/lib/postgresql/data`: Creates a Docker volume named `pgdata` to persist your database data, so it's not lost when the container stops.
      - `-d postgres`: Runs the `postgres` image in detached mode (background).

    - **Create the `news_db` database:**
      Once the container is running, execute a command inside it to create your database:

      ```bash
      docker exec -it news-postgres-db psql -U postgres
      ```

      Enter the `POSTGRES_PASSWORD` you set (`mysecretpassword` in this example) when prompted.
      At the `psql` prompt (`postgres=#`), run:

      ```sql
      CREATE DATABASE news_db;
      \q
      ```

      (`\q` exits the `psql` shell).

    - **Docker Management Commands for PostgreSQL:**
      - Stop: `docker stop news-postgres-db`
      - Start: `docker start news-postgres-db`
      - Remove: `docker rm news-postgres-db` (removes container, but data in `pgdata` volume persists)

4.  **Object Storage Setup (MinIO with Docker)**

    We'll use MinIO to emulate S3-compatible object storage locally.

    - **Pull the MinIO image:**
      ```bash
      docker pull minio/minio
      ```
    - **Run the MinIO container:**

      ```bash
      docker run -p 9000:9000 -p 9001:9001 \
        --name minio_server \
        -d --rm \
        -v "$(pwd)/minio_data:/data" \
        minio/minio server /data --console-address ":9001"
      ```

      **Explanation:**

      - `-p 9000:9000`: Maps the MinIO S3 API endpoint (your app connects here).
      - `-p 9001:9001`: Maps the MinIO Console web UI.
      - `--name minio_server`: Assigns a name to the container.
      - `-d --rm`: Runs in detached mode and automatically removes the container when stopped.
      - `-v "$(pwd)/minio_data:/data"`: Mounts a local `minio_data` folder (relative to your current terminal directory) for persistent storage of uploaded files.
      - `--console-address ":9001"`: Enables the web console.

    - **Access the MinIO Console & Create Bucket:**

      1.  Open your browser and navigate to: `http://localhost:9001`
      2.  Log in with the default credentials:
          - **Access Key:** `minioadmin`
          - **Secret Key:** `minioadmin`
      3.  Once logged in, click **"+ Create Bucket"** (bottom right or top left).
      4.  Enter the bucket name: `news-videos` (this must match the name in your `.env` file).
      5.  Click "Create Bucket".

    - **Docker Management Commands for MinIO:**
      - Stop: `docker stop minio_server`
      - Start: `docker start minio_server`
      - Remove: `docker rm minio_server`

5.  **Environment Variables (`.env` file)**

    Create a file named `.env` in the root directory of your project. This file will store sensitive information and configurations.

    ```dotenv
    # .env

    # Application Port
    PORT=3000

    # PostgreSQL Database Configuration
    # Replace 'mysecretpassword' with the password you set for POSTGRES_PASSWORD
    DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/news_db"

    # MinIO (Local S3 Emulator) Configuration
    MINIO_ENDPOINT="http://localhost:9000"
    MINIO_ACCESS_KEY="minioadmin"
    MINIO_SECRET_KEY="minioadmin"
    MINIO_BUCKET_NAME="news-videos" # Must match the bucket name created in MinIO
    ```

6.  **Run the Application:**

    First, build the TypeScript project, then start the server. For development, `dev:watch` is convenient.

    ```bash
    # For initial build and start
    npm run dev

    # Or, for development with live reloading on code changes
    npm run dev:watch
    ```

    You should see messages indicating "Database synchronized successfully." and "Server running on port 3000".

## API Endpoints

Once the server is running, you can interact with the API using tools like `curl` (command line) or GUI clients like Postman/Insomnia. All examples assume your API is running on `http://localhost:3000`.

### 1. `POST /api/articles` - Create a new article

Creates a new article, optionally with an associated video and thumbnail image.
This endpoint expects `multipart/form-data`.

- **Method:** `POST`
- **URL:** `http://localhost:3000/api/articles`
- **`curl` Example:**

  ```bash
  curl -X POST \
    -H "Content-Type: multipart/form-data" \
    -F "title=My Awesome News Article" \
    -F "content=This is the amazing content of my news article, detailing recent events and insights." \
    -F "tags=news,technology,trending" \
    -F "categories=breaking,science" \
    -F "video=@/path/to/your/local/video.mp4" \
    -F "thumbnail=@/path/to/your/local/image.jpg" \
    http://localhost:3000/api/articles
  ```

  _(Replace `/path/to/your/local/video.mp4` and `/path/to/your/local/image.jpg` with actual paths on your machine. You can omit `video` or `thumbnail` if not needed.)_

- **Postman/Insomnia Example:**
  - Set **Method** to `POST`.
  - Set **Body** to `form-data`.
  - Add keys:
    - `title` (Text): `My Awesome News Article`
    - `content` (Text): `This is the amazing content of my news article, detailing recent events and insights.`
    - `tags` (Text): `news,technology,trending`
    - `categories` (Text): `breaking,science`
    - `video` (File): Select your video file.
    - `thumbnail` (File): Select your image file.

### 2. `GET /api/articles` - Retrieve all articles

Retrieves a list of all articles, including their associated tags and categories.

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/articles`
- **`curl` Example:**

  ```bash
  curl -X GET http://localhost:3000/api/articles
  ```

### 3. `GET /api/articles/:id` - Retrieve a single article

Retrieves a specific article by its UUID.

- **Method:** `GET`
- **URL:** `http://localhost:3000/api/articles/YOUR_ARTICLE_UUID`
  _(Replace `YOUR_ARTICLE_UUID` with an actual UUID from a created article, e.g., `a1b2c3d4-e5f6-4789-abcd-1234567890ab`)_
- **`curl` Example:**

  ```bash
  curl -X GET http://localhost:3000/api/articles/a1b2c3d4-e5f6-4789-abcd-1234567890ab
  ```

### 4. `PUT /api/articles/:id` - Update an existing article

Updates an existing article's title, content, tags, categories, or even image/video URLs (if provided directly).
This endpoint expects `application/json`.

- **Method:** `PUT`
- **URL:** `http://localhost:3000/api/articles/YOUR_ARTICLE_UUID`
  _(Replace `YOUR_ARTICLE_UUID` with the UUID of the article you want to update.)_
- **`curl` Example:**

  ```bash
  curl -X PUT \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Article Title",
      "content": "This content has been updated to reflect recent changes.",
      "tags": "updated,hot-news",
      "categories": "local,politics"
    }' \
    http://localhost:3000/api/articles/a1b2c3d4-e5f6-4789-abcd-1234567890ab
  ```

- **Postman/Insomnia Example:**
  - Set **Method** to `PUT`.
  - Set **Body** to `raw` and select `JSON`.
  - Paste the JSON payload into the body.

### 5. `DELETE /api/articles/:id` - Delete an article

Deletes a specific article by its UUID.

- **Method:** `DELETE`
- **URL:** `http://localhost:3000/api/articles/YOUR_ARTICLE_UUID`
  _(Replace `YOUR_ARTICLE_UUID` with the UUID of the article you want to delete.)_
- **`curl` Example:**

  ```bash
  curl -X DELETE http://localhost:3000/api/articles/a1b2c3d4-e5f6-4789-abcd-1234567890ab
  ```

## TODOs

- [ ] Implement comprehensive input validation for all API endpoints using `express-validator`.
- [ ] Add user authentication and authorization.
- [ ] Implement pagination and filtering for article retrieval.
- [ ] Add logic for deleting files from MinIO/S3 when an article (or its associated file) is deleted.
- [ ] Create dedicated endpoints for managing tags and categories independently.
- [ ] Write unit and integration tests.
- [ ] Set up CI/CD pipeline.
- [ ] Deploy to a cloud provider (e.g., AWS, GCP).

## Contributing

Feel free to open issues or submit pull requests.

## License

[MIT License](LICENSE) (You might want to create a LICENSE file if you haven't already).
