const express = require('express');
const router = express.Router();
const {
  getInstagramData,
  getProperties,
  getPropertiesByZone,
  getPropertiesByNewPropertyAndLocation,
  getStories,
  getPropertyById
} = require('../controllers/contentfulController');

/**
 * @route GET /api/contentful/instagram
 * @desc Obtener todos los posts de Instagram desde Contentful
 * @access Public
 */
router.get('/instagram', getInstagramData);

/**
 * @route GET /api/contentful/properties
 * @desc Obtener propiedades desde Contentful
 * @access Public
 */
router.get('/properties', getProperties);

/**
 * @route GET /api/contentful/properties/zone/:zone
 * @desc Obtener propiedades filtradas por zona específica
 * @access Public
 */
router.get('/properties/zone/:zone', getPropertiesByZone);

/**
 * @route GET /api/contentful/properties/newproperty/:newProperty
 * @route GET /api/contentful/properties/newproperty/:newProperty/location/:location
 * @desc Obtener propiedades filtradas por newProperty (Inversión/Preconstrucción) y opcionalmente por localidad
 * @access Public
 */
router.get('/properties/newproperty/:newProperty', getPropertiesByNewPropertyAndLocation);
router.get('/properties/newproperty/:newProperty/location/:location', getPropertiesByNewPropertyAndLocation);

/**
 * @route GET /api/contentful/stories
 * @desc Obtener stories desde Contentful con campos name, positionJob, images y videoLink
 * @access Public
 */
router.get('/stories', getStories);

/**
 * @route GET /api/contentful/properties/:propertyId
 * @desc Obtener una propiedad específica por ID desde Contentful
 * @access Public
 */
router.get('/properties/:propertyId', getPropertyById);

module.exports = router;