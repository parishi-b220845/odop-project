const router = require('express').Router();
const map = require('../controllers/mapController');

// Districts & Map
router.get('/districts', map.getDistricts);
router.get('/districts/:name', map.getDistrictDetail);
router.get('/stats', map.getMapStats);

// ODOP Dataset
router.get('/odop', map.getOdopDataset);
router.get('/odop/states', map.getOdopStates);

// Cultural Articles
router.get('/articles', map.getArticles);
router.get('/articles/:slug', map.getArticle);

module.exports = router;
