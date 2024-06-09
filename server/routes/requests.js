import express from "express";
import pool from "../db.js";

const router = express.Router();

//send friend request
router.post("/send_request", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    const receiver = await pool.query(
      "SELECT * FROM friendship WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
      [sender_id, receiver_id]
    );

    if (receiver.rows.length >= 1)
      return res.status(406).json("already friends with this user");

    const friendRequest = await pool.query(
      "SELECT * FROM pending_friendship WHERE receiver_id = $1 AND sender_id = $2",
      [receiver_id, sender_id]
    );

    if (friendRequest.rows.length >= 1)
      return res.status(406).json("friend request already sent");

    await pool.query(
      "INSERT INTO pending_friendship (receiver_id, sender_id) VALUES ($1, $2)",
      [receiver_id, sender_id]
    );

    res.json("sent friend request");
  } catch (error) {
    console.log(error);
    res.status(500).json("server error");
  }
});

//reject or delete friend request
router.delete("/delete_request", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;
    await pool.query(
      "DELETE FROM pending_friendship WHERE sender_id = $1 AND receiver_id = $2",
      [sender_id, receiver_id]
    );
    res.status(200).json("deleted friend request");
  } catch (err) {
    console.log(err);
    res.status(500).json("server error");
  }
});

//add friend
router.post("/add", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    const friendRequest = await pool.query(
      "SELECT * FROM friendship WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
      [receiver_id, sender_id]
    );
    if (friendRequest.rows.length >= 1)
      return res.status(406).json("already accepted friend request");

    await pool.query(
      "INSERT INTO friendship (user1_id, user2_id) VALUES ($1, $2)",
      [receiver_id, sender_id]
    );

    res.json("added user as friend");
  } catch (err) {
    console.log(err);
    res.status(500).json("server error");
  }
});

//remove friend
router.delete("/delete", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;
    await pool.query(
      "DELETE FROM friendship WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
      [sender_id, receiver_id]
    );
    res.status(200).json("removed friend");
  } catch (err) {
    console.log(err);
    res.status(500).json("server error");
  }
});

export default router;
