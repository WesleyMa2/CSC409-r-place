## NEED TO SETUP AWS CLI FIRST
zip -r function.zip . 
aws lambda update-function-code --function-name  place-update-bitfield --zip-file fileb://function.zip