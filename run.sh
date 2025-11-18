#!/bin/bash

export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

echo "Starting Tourist Shop..."
java -jar target/tourist-shop-1.0.0.jar
