FROM nginx:alpine
COPY index.html  /usr/share/nginx/html
COPY favicon.png /usr/share/nginx/html
