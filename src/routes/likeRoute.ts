import express from 'express';
import {
    CreateLike
} from '../controller/likeController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/create', auth, CreateLike );


export default router;
