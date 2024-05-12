# Slack Integration Backend

Deployment URL = https://api-slack.jaay.fun

create a duplicate of .env.example and rename it to .env

```
GOOGLE_CLIENT_ID=<value>
GOOGLE_CLIENT_SECRET=<value>
GOOGLE_REDIRECT_URI=<value>
MONGODB_URI=<value>
SECRET=<value>
SLACK_CLIENT_ID=<value>
SLACK_CLIENT_SECRET=<value>
SLACK_REDIRECT_URI=<value>
FRONTEND_URL=<value>
```

Environment Variable Prefix with GOOGLE are Social login Credential

Which are to be obtained from [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

Env Variable with SLACK belong with Slack APP integration and are required to add those from Slack App Integration page

SECRET is required for decrypting/encrypting access token

since the frontend doesn't store authentication state (time based session auth used in backend) it is important FRONTEND_URL to be given so that app can allow cors and allow credential exchange

## How to Run ?

` npm install` -> Install Dependency

`npm run start` -> Start the webserver (defaults to port 3000)

## Third Party References

Slack Oauth Documentaion :- [https://api.slack.com/authentication/oauth-v2](https://api.slack.com/authentication/oauth-v2)

Slack API Method Reference :- [https://api.slack.com/methods](https://api.slack.com/methods)

Lucia Auth (used for implementing session auth with full type safety) :- [https://github.com/lucia-auth/lucia](https://github.com/lucia-auth/lucia)
