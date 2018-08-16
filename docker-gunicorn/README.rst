1. Prepare the front-end:

   1. Copy a suitable front-end configuration in place (into
      ``src/config/config.constant.js``).

   2. (Optional) Replace references to dependencies with minified versions in
      ``index.html``.

   3. Run ``git clean -xid frontend/ && yarn build`` from the root of the
      landmark-reg repository.

2. Build the Docker image with ``docker build -t gunicorn-landmark-reg -f ./Dockerfile ..``