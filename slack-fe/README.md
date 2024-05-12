# Slack API Frontend

Deployment URL = https://slack.jaay.fun/

1. [Introduction](#introduction)
2. [How to Run ?](#how-to-run-)
3. [Third Party References](#third-party-references)

## Introduction

The Frontend consists of 3 screens:

1. Login
2. Dashboard
3. Callback (used by backend to redirect after authentication, not a screen)

#### Library

1. React Router
2. Axios

### How to Run ?

Create a Copy of .env.example and rename it to .env

replace VITE_PUBLIC_API_URL with backend url

`npm install`

`npm run build`

`npm run preview`
