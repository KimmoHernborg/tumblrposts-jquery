#!/bin/bash
DIST=dist
if [ ! -d $DIST ]; then mkdir $DIST; fi

uglifyjs TumblrPosts.js -o "TumblrPosts.min.js" -c -m
node-sass --output-style compressed tumblr.scss tumblr.css

cp -f tumblr.html $DIST/
cp -f tumblr.css $DIST/
cp -f TumblrPosts.min.js $DIST/