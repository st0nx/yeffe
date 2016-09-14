#!/bin/bash
echo $0: Creating virtual environment
virtualenv --prompt="gmarketplace" ./env

mkdir ./logs
mkdir ./pids
mkdir ./db
mkdir ./static_content
mkdir ./static_content/media

echo $0: Installing dependencies
source ./env/bin/activate
export PIP_REQUIRE_VIRTUALENV=true
./env/bin/pip install --requirement=./requirements.conf --log=./logs/build_pip_packages.log

echo $0: Making virtual environment relocatable
virtualenv --relocatable ./env

echo $0: Creating virtual environment finished.
