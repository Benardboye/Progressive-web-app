import express, { Request, Response, NextFunction } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import colors from "colors";
import log from "./utils/logger";
import userRouter from "./routes/userRoute";
import likeRoute from "./routes/likeRoute";
import { db } from "./config/indexDB";
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

//Sequalize conncetion
db.sync().then(() => {
    log.info('Db connected succesfully')
}).catch(err => {
    log.error(err)
})



const app = express();

app.use(cors())    //THIS ENABLE CONNECTION BETWEEN FRONTEND TO BACKEND
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());


//ROUTER
app.use("/api/likes", likeRoute);
app.use("/api/user", userRouter);


const port = 3001;



app.listen(port, () => {
  log.info(`Server is listening at port: ${port}`);
});

export default app;
