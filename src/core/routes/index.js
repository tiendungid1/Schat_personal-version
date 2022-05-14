import { Router } from 'express';

const router = Router();

/* GET login page */
router.get('/login', (req, res) => {
    res.render('pages/login');
});

/* GET home page */
router.get('/', (req, res) => {
    res.render('pages/home');
});

export const clientRouter = router;
