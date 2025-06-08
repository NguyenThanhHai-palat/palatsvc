const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Xin chào từ server Node.js!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
