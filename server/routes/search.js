import express from "express";
import pool from "../db.js";
import dataTagAdder from "../utils/datTagAdder.js";

const router = express.Router();

//get all pending friends
router.get("/pending_friends/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const pendingFriends = await pool.query(
      `SELECT displayed_name, user_image, user_id FROM pending_friendship JOIN account ON user_id = sender_id WHERE receiver_id = $1`,
      [user_id]
    );
    res.json(dataTagAdder(pendingFriends.rows));
  } catch (error) {
    console.log(error);
  }
});

//get friends
router.get("/friends/:user_id/:query", async (req, res) => {
  const { user_id, query } = req.params;
  try {
    const response = await pool.query(
      `SELECT a1.displayed_name as displayed_name_1, a1.user_image as user_image_1, a1.user_id as user_id_1 , a2.displayed_name as displayed_name_2, a2.user_image as user_image_2, a2.user_id as user_id_2 FROM friendship JOIN account a1 ON a1.user_id = user1_id JOIN account a2 ON a2.user_id = user2_id WHERE (user1_id = $1 OR user2_id = $1) LIMIT 5`,
      [user_id]
    );
    const friends = response.rows
      .map(r => {
        return r.user_id_1 === user_id
          ? {
              displayed_name: r.displayed_name_2,
              user_image: r.user_image_2,
              user_id: r.user_id_2,
            }
          : {
              displayed_name: r.displayed_name_1,
              user_image: r.user_image_1,
              user_id: r.user_id_1,
            };
      })
      .filter(fr =>
        fr.displayed_name.toLowerCase().includes(query.toLowerCase())
      );

    res.json(dataTagAdder(friends));
  } catch (error) {
    console.log(error);
  }
});

//query username
router.get("/names/:user_id/:query", async (req, res) => {
  const { query, user_id } = req.params;
  try {
    const accounts = await pool.query(
      `SELECT user_id, displayed_name, user_image FROM account WHERE displayed_name ~* $1 AND user_id <> $2 LIMIT 12`,
      [query, user_id]
    );
    res.json(dataTagAdder(accounts.rows));
  } catch (error) {
    console.log(error);
  }
});

export default router;
