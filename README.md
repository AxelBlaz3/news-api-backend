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

## API Endpoints (Quick Overview)

Once the server is running, you can interact with the API using tools like Postman, Insomnia, or curl.

- `POST /api/articles`: Create a new article (supports `multipart/form-data` for `video` and `thumbnail` files, and JSON for `title`, `content`, `tags`, `categories`).
- `GET /api/articles`: Retrieve all articles.
- `GET /api/articles/:id`: Retrieve a single article by ID.
- `PUT /api/articles/:id`: Update an existing article by ID.
- `DELETE /api/articles/:id`: Delete an article by ID.

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
