import app from "./app.js"; //imports the app instance from app.ts

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
