#!/bin/bash

export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

echo "Building frontend and backend..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "Build complete! Run with: ./run.sh"
else
    echo "Build failed!"
    exit 1
fi
