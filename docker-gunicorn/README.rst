1. Prepare the back-end:

   1. Run `git clean -xid backend/ && tar -czf landmark-reg-backend.tar.gz backend/` from the root of the landmark-reg
      repository.

   2. Copy the resulting archive to this directory (`cp
      landmark-reg-backend.tar.gz docker-gunicorn/`).

2. Prepare the front-end:

   1. Copy a suitable front-end configuration in place (into
      `src/config/config.constant.js`).

   2. (Optional) Replace references to dependencies with minified versions in
      `index.html`.

   3. Run `git clean -xid frontend/ && yarn build` from the root of the
      landmark-reg repository.

   4. Run `tar --exclude=zoomer-data -chzf landmark-reg-frontend.tar.gz frontend/`

   5. Copy the resulting archive to this directory: `cp
      landmark-reg-frontend.tar.gz docker-gunicorn/`).

3. Copy `requirements.txt` into this directory: `cp requirements.txt
   docker-gunicorn/`.

4. Build the Docker image with `docker build .`.
