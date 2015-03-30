@echo off
CALL UGLIFYJS TumblrPosts.js -o "TumblrPosts.min.js" -c -m
CALL NODE-SASS --output-style compressed tumblr.scss tumblr.css
REM CALL NODE-SASS tumblr.scss tumblr.css

IF NOT EXIST dist MKDIR dist
COPY /Y tumblr.html dist
COPY /Y tumblr.css dist
COPY /Y TumblrPosts.min.js dist