import express from "express";
import { getPool } from "./db.js";

const router = express.Router();

// Buscar todas as mensagens
router.get("/messages", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM Messages ORDER BY CreatedAt ASC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Criar nova mensagem
router.post("/messages", async (req, res) => {
  try {
    const { conversationId, senderId, receiverId, content } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input("conversationId", senderId)
      .input("senderId", senderId)
      .input("receiverId", receiverId)
      .input("content", content)
      .query(`
        INSERT INTO Messages (ConversationId, SenderId, ReceiverId, Content)
        VALUES (@conversationId, @senderId, @receiverId, @content);
        SELECT SCOPE_IDENTITY() AS Id;
      `);

    res.json({ id: result.recordset[0].Id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
