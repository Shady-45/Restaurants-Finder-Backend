require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
//get all restaraunts
app.get("/api/v1/restaurants", async (req, res) => {
  try {
    const results = await db.query(
      "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as avg_rating from reviews group by restaurant_id ) reviews on restaurants.id = reviews.restaurant_id;"
    );
    console.log(results);
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        restaraunt: results.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
});
// get a restaraunt
app.get("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(
      "select * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating),1) as avg_rating from reviews group by restaurant_id ) reviews on restaurants.id = reviews.restaurant_id WHERE id = $1",
      [req.params.id]
    );
    const reviews = await db.query(
      "SELECT * from reviews WHERE restaurant_id = $1",
      [req.params.id]
    );
    console.log(results.rows);
    res.status(200).json({
      status: "success",
      data: {
        restaraunt: results.rows[0],
        review: reviews.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

// create a restaraunt
app.post("/api/v1/restaurants", async (req, res) => {
  try {
    const results = await db.query(
      "INSERT INTO restaurants (name,location,price_range) values($1, $2, $3) returning *",
      [req.body.name, req.body.location, req.body.price_range]
    );
    res.status(201).json({
      status: "success",
      data: {
        restaurants: results.rows[0],
      },
    });
  } catch (error) {
    console.log(error);
  }
});
// update a restaraunt
app.put("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE restaurants SET name=$1, location=$2, price_range=$3 WHERE id = $4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.params.id]
    );
    console.log(results.rows[0]);
    res.status(200).json({
      status: "sucsess",
      data: {
        restaraunt: results.rows[0],
      },
    });
  } catch (error) {
    console.log(error);
  }
});
// delete a restaurant
app.delete("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(" DELETE FROM restaurants where id =$1", [
      req.params.id,
    ]);
    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
});

// create a review

app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
  try {
    const result = await db.query(
      "INSERT INTO reviews (restaurant_id,name,review,rating) values($1,$2,$3,$4)returning *",
      [req.params.id, req.body.name, req.body.review, req.body.rating]
    );
    console.log(result);
    res.status(201).json({
      status: "success",
      data: {
        review: result.rows,
      },
    });
  } catch (error) {
    console.log(error);
  }
});
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`app listening on ${port}`);
});
