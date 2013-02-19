#!/bin/sh

cp buildscript/makexpi.sh ./
./makexpi.sh -n donotsend -v
rm ./makexpi.sh
