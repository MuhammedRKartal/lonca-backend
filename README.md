# Supplier Dashboard Backend

This project aims to provide vendors with detailed insights into their sales performance, both numerically and visually. The homepage displays a list of all vendors contributing to the supplier, allowing anyone to view the sales data of specific companies, as there is no authentication system in place.

## Tech Stack,

**Node:** v20.18.0

**Main:** Node, Express, Typescript, Mongoose

**Test:** Jest, Mockingoose

**Others:** Winston, Nodemon, Cors

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`

`PORT`

## API Reference

#### Get all vendors

```http
  GET /vendors
```

#### Get total products info sold by vendor

```http
  GET /orders/${vendorName}
```

| Parameter    | Type     | Description                           |
| :----------- | :------- | :------------------------------------ |
| `vendorName` | `string` | **Required**. Name of vendor to fetch |

#### Get monthly selling rates by vendor

```http
  GET /orders/monthly/${vendorName}/${year}
```

| Parameter    | Type     | Description                            |
| :----------- | :------- | :------------------------------------- |
| `vendorName` | `string` | **Required**. Name of vendor to fetch  |
| `year`       | `string` | **Required**. Determined year to fetch |

## Run Locally

Clone the project

```bash
git clone https://github.com/MuhammedRKartal/lonca-backend.git
```

Go to the project directory

```bash
cd ./backend
```

Install dependencies

```bash
yarn
```

Copy the environment variables and edit

```bash
cp .env.example .env
```

Edit the DATABASE_URL in .env with your database

```bash
DATABASE_URL="mongodb+srv://<username>:<pswd>@<db-conn-url>/<db-name>"
```

Start the server

```bash
yarn dev
```

## Running Tests

To run tests, run the following command

```bash
  yarn test
```
