zip -r server.zip . --exclude=*node_modules* &&
aws s3 sync . s3://csc409-place-server/ --include server.zip