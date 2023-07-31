## Description

## Voucher Pool

A voucher pool is a collection of voucher codes that can be used by customers to get discounts on website. 
Each code may only be used once, and we would like to know when it was used by the customer. 
Since there can be many customers in a voucher pool, we need a call that auto-generates voucher 
codes for each customer.

---

### Covered Points
* [x] Design a database schema ``migrations``
* [x] Write an application
* [x] API endpoint for verifying and redeeming vouchers
* [x] Implement API Rate Limiting: Protect the API from abuse by implementing rate limiting on the endpoints.
* [x] Use Database Transactions: Ensure data consistency by implementing use of transactions in your application.
* [x] Write unit tests
* [x] Using Typescript
* [x] A nice little Readme on how to run
* [x] ***PLUS POINT:*** Writing swagger for the API
* [x] ***PLUS POINT:*** Docker file to setup the whole application with all the dependencies (database, nodejs)

---
## Requirements
1. [**Docker**](https://docs.docker.com/get-docker/) and [**Docker-compose**](https://docs.docker.com/compose/install/) installed on your machine
2. Ports `3001` and `5432` are free

## Installation & Running
**Docker Compose**

The below command will make everything `Database, Migrations, App` up and running

```bash
$ docker-compose up --build
```
>Hint: I kept the `.env` file in repo intentionally for easy setup


## Documentation
Swagger API documentation
```
http://localhost:3001/api
```

## Test

```
```bash
# unit tests
$ npm run test
```
