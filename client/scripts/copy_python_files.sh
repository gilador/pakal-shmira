#!/bin/bash

# Create the python directory in the app's document directory
mkdir -p $EXPO_DOCUMENT_DIR/python

# Copy the Python files
cp src/services/python/*.py $EXPO_DOCUMENT_DIR/python/ 