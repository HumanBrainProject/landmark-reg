# landmark-reg

Interactive tool for landmark-based spatial alignment of volumetric images

# Retired project

This code base is now retired, it has served its purpose as a prototype and has been refactored and renamed to **Voluba**:

- the front-end [has been rewritten from scratch](https://github.com/FZJ-INM1-BDA/landmark-reg/) using the Vue.js framework and Neuroglancer as a viewer component;

- the back-end has been extracted and is maintained in [a separate repository](https://github.com/HumanBrainProject/voluba-linear-backend).

A production deployment of **Voluba** is available at https://voluba.apps.hbp.eu/.

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

# Developement set-up

Prerequisites:
* Python version 3.4 or later;
* Nodejs and the [yarn](https://yarnpkg.com/) package manager.

First, set up a virtual environment for the back-end under `venv/`, and install
the dependencies there:

    python3 -m venv venv
    . venv/bin/activate
    python -m pip install -r requirements.txt


Once this is done, you can use `yarn install` to install the dependencies, `yarn
start` to build the front-end, and start the backend in debug mode.

    . venv/bin/activate
    yarn install
    yarn start

The app should be accessible on http://localhost:5000/ .

If you make changes to the front-end you may want to use `yarn run test:watch`
to automatically run tests on every change, and `yarn run build:watch` to
automatically re-build the JavaScript bundle that is served to the browser
(`frontend/bundle`).


# Tests

## Unit-tests for the frontend

    yarn run test

## Unit-tests for the backend

TODO

## End-to-end tests

TODO
