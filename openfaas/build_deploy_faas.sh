#! /bin/bash

faas-cli build --build-arg 'ADDITIONAL_PACKAGE=gcc musl-dev' -f ./landmark-reg.yml &&
faas-cli deploy -f ./landmark-reg.yml
