import express from 'express';
import {
    getSettings,
    updateSettings,
    updateTheme
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/theme', updateTheme);

export default router;