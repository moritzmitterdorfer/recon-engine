<img src="https://github.com/moritzmitterdorfer/recon-engine/blob/master/client/static/assets/recon-img.png">

# recon-engine
🍭 recommendations as a service (RaaS) web api
<br>
I guess I've entered callback hell ):

## What's RaaS?
RaaS means recommendations as a service. Basically you offer the functionality of a recommendation engine.

## Stack
- express
- firestore (firebase)
- apriori for association-rule mining

## Host
Soon

## Install
### CDN
Soon
### NPM
Soon

## Flow
 - [x] create Google Firebase DB
    - [x] create data model
 - [x] setup git
 - [x] setup npm
 - [x] create express app
    - [x] install nodemon
    - [x] install joi (NPM package) for validation
 - [x] create client folder
    - [x] create views and index.html
 - [x] create /api/v1 middleware
 - [x] make token system
    - [x] client can request token
    - [x] endpoint in express
    - [x] update database
 - [x] create user and item pair
    - [x] express enpoint
    - [x] validate data with Joi
    - [x] update database
 - [x] create apriori association-rule mining algorithm
 - [x] train model
    - [x] make express endpoint
    - [x] get all data
    - [x] train Apriori
    - [x] save created rules in new collection
 - [x] endpoint for recommendations
    - [x] get userID
    - [x] retrieve his items from DB
    - [x] initialize Rule object
    - [x] get all new items from rule.applyAll
    - [x] send them back to the client
    - [x] store when query is made
 - [x] rules (filter accroding to twice and already interacted)
 - [ ] apriori does not work: A -> {B,C}!! -> make function recursive!
 - [ ] class Rules -> eror: apriori can have to items as inputs
 - [x] create mini-SDK
 - [ ] deploy it (CDN and NPM)
    - [ ] where? Heroku often "sleeps"
 - [ ] landing page
 - [ ] bug fixing / validation
 - [ ] leave callback hell!
 - [ ] improve data model

## TODO:
 - [ ] different algorithms
 - [ ] real time functionality (no training)
 - [ ] hybrid functionality (realtime and historical for faster queries)
 - [ ] product descriptions
 - [ ] user actions (different weights)
 - [ ] model dashboard at /:token
