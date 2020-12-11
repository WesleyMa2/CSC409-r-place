npm run build &&
aws s3 sync dist/ s3://csc409-place-client/ --acl public-read