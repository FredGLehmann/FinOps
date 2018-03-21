aws cloudformation package \
   --template-file /home/ec2-user/environment/FinOps/template.yaml \
   --output-template-file git_ignore/serverless-output.yaml \
   --s3-bucket pprod-deploy
