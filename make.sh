#!/bin/sh

cp buildscript/make_new.sh ./
./make_new.sh donotsend version=1
rm ./make_new.sh