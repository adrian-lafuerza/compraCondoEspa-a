const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const propertyService = {
  /**
   * Obtener propiedades desde la API de Idealista
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.location - Ubicación (ej: 'Madrid')
   * @param {string} params.operation - Tipo de operación ('sale' o 'rent')
   * @param {string} params.propertyType - Tipo de propiedad ('homes', 'offices', etc.)
   * @param {number} params.maxItems - Número máximo de resultados
   * @param {number} params.numPage - Número de página
   * @returns {Promise<Object>} Respuesta de la API con propiedades
   */
  async getProperties(params = {}) {
    try {
        // Construir parámetros de consulta para Contentful
        const queryParams = new URLSearchParams();

        // Agregar parámetros opcionales
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/contentful/properties`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.data && data.data.properties) {
          return {
            success: true,
            data: {
              properties: data.data.properties
            }
          };
        } else {
          throw new Error(data.message || 'Error al obtener propiedades');
        }
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Obtener propiedades hardcodeadas (para desarrollo/testing)
   * @returns {Array} Array de propiedades de ejemplo
   */
  async getPropertiesHardcoded() {
    try {
      return [
        {
          propertyId: 106444490,
          type: "flat",
          address: {
            streetName: "de Padilla",
            streetNumber: "80",
            visibility: "street",
            postalCode: "28006",
            town: "Madrid",
            country: "Spain",
            floor: "2",
            latitude: 40.4309469,
            longitude: -3.6728835
          },
          reference: "EC-3039B",
          contactId: 88485756,
          operation: {
            type: "sale",
            price: 1909000
          },
          descriptions: [
            {
              language: "es",
              text: "Inmueble completamente reformado, y equipado y con 3 dormitorios y 3 baños todos ellos en suite. Aseo de cortesía. El piso cuenta con amplio salón - comedor.\n\nVivienda totalmente reformada en el prestigioso barrio de Lista, Distrito Salamanca\n\nEl piso se vende amueblado con muebles de diseño. El suelo, de tarima, con dibujo de espiga, hace que los ambientes se vean amplios y lujosos.\n\nTres dormitorios, con armarios empotrados y tres baños. Cocina abierta al comedor totalmente equipada con modernos electrodomésticos.\n\nLa finca cuenta con ascensor, aire acondicionado y servicio de portería.\n\nEl barrio de ofrece una amplia variedad de servicios y comodidades. A pocos pasos del emblemático Parque del Retiro y rodeado de tiendas, restaurantes gourmet y prestigiosas galerías de arte."
            },
            {
              language: "en",
              text: "Property completely renovated and equipped with 3 bedrooms and 3 bathrooms all en suite. Courtesy toilet. The apartment has a large living - dining room.\n\nHousing completely renovated in the prestigious neighborhood of Lista, Salamanca District.\n\nThe apartment is sold furnished with designer furniture. The floor, wooden floor, with herringbone pattern, makes the rooms look spacious and luxurious.\n\nThree bedrooms with fitted closets and three bathrooms. Kitchen open to the dining room fully equipped with modern appliances.\n\nThe property has an elevator, air conditioning and concierge service.\n\nThe neighborhood offers a wide variety of services and amenities. A few steps from the emblematic Retiro Park and surrounded by stores, gourmet restaurants and prestigious art galleries."
            }
          ],
          additionalLink: "https://www.erikacasals.com/ad/106444490",
          scope: "tools",
          state: "active",
          features: {
            areaConstructed: 158,
            balcony: false,
            bathroomNumber: 3,
            conditionedAir: true,
            conservation: "good",
            energyCertificateRating: "D",
            "energyCertificateEmissionsRating": "D",
            "garden": false,
            "handicappedAdaptedAccess": false,
            "handicappedAdaptedUse": false,
            "orientationNorth": false,
            "orientationSouth": false,
            "orientationWest": false,
            "orientationEast": false,
            "parkingAvailable": false,
            "pool": false,
            "rooms": 3,
            "storage": false,
            "terrace": false,
            "wardrobes": true,
            "heatingType": "individual_gas",
            "priceCommunity": 178,
            "currentOccupation": "free",
            "studio": false,
            "penthouse": false,
            "liftAvailable": true,
            "windowsLocation": "internal",
            "duplex": false
          },
          "images": [
            {
              "imageId": 1326957173,
              "order": 1,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ae/4a/bd/1326957173.jpg",
              "originalMD5CheckSum": "dcf5fd1be4b4be7a175fbeaf0693a351",
              "state": "processed"
            },
            {
              "imageId": 1326957195,
              "order": 2,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/9f/68/95/1326957195.jpg",
              "originalMD5CheckSum": "e627bb1ed1e6c3fe37d01449393ee4b8",
              "state": "processed"
            },
            {
              "imageId": 1326957136,
              "order": 3,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ff/78/95/1326957136.jpg",
              "originalMD5CheckSum": "d640a92fe1dcb55c36cac0d271d3d04d",
              "state": "processed"
            },
            {
              "imageId": 1326957109,
              "order": 4,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/3d/6c/73/1326957109.jpg",
              "originalMD5CheckSum": "c87132b36e2d371456a73bd68259386a",
              "state": "processed"
            },
            {
              "imageId": 1326957111,
              "order": 5,
              "label": "walk_in_wardrobe",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/d4/0f/9c/1326957111.jpg",
              "originalMD5CheckSum": "a44c5b493cda52684e651c562d8ab7c4",
              "state": "processed"
            },
            {
              "imageId": 1326957112,
              "order": 6,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/d5/97/c2/1326957112.jpg",
              "originalMD5CheckSum": "f40f3bce8e62899b2c6fc4846494e0c4",
              "state": "processed"
            },
            {
              "imageId": 1326957129,
              "order": 7,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/cd/77/44/1326957129.jpg",
              "originalMD5CheckSum": "03ec678e551bd46c742fdeb322e96216",
              "state": "processed"
            },
            {
              "imageId": 1326957091,
              "order": 8,
              "label": "kitchen",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/8e/dc/a9/1326957091.jpg",
              "originalMD5CheckSum": "b3ae2dd1a7508dd091eda1316bd33d4a",
              "state": "processed"
            },
            {
              "imageId": 1326957117,
              "order": 9,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/a5/5d/07/1326957117.jpg",
              "originalMD5CheckSum": "e1c48788f2b36fde2521fbd5a72c7c02",
              "state": "processed"
            },
            {
              "imageId": 1326957113,
              "order": 10,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/65/1e/96/1326957113.jpg",
              "originalMD5CheckSum": "a747d60d4cb3c810368cfc636b32a885",
              "state": "processed"
            },
            {
              "imageId": 1326957175,
              "order": 11,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/32/8d/9f/1326957175.jpg",
              "originalMD5CheckSum": "dcc4f3d54d47dba1af425e24d60b0162",
              "state": "processed"
            },
            {
              "imageId": 1326957177,
              "order": 12,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ac/32/13/1326957177.jpg",
              "originalMD5CheckSum": "fb04a861e86b6db77d9b1bd076e8693d",
              "state": "processed"
            },
            {
              "imageId": 1326957131,
              "order": 13,
              "label": "walk_in_wardrobe",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/5e/09/05/1326957131.jpg",
              "originalMD5CheckSum": "b05c828ac68baf1c4dc2dbd25ddb8789",
              "state": "processed"
            },
            {
              "imageId": 1326957179,
              "order": 14,
              "label": "kitchen",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/da/f9/58/1326957179.jpg",
              "originalMD5CheckSum": "e0f6e66d29b0c28f1b7efc2e62fce101",
              "state": "processed"
            },
            {
              "imageId": 1326957188,
              "order": 15,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/6b/ae/ee/1326957188.jpg",
              "originalMD5CheckSum": "6821c36875438ce82ab84e47d60cc5e4",
              "state": "processed"
            },
            {
              "imageId": 1283098554,
              "order": 16,
              "label": "plan",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/e8/94/5a/1283098554.jpg",
              "originalMD5CheckSum": "9cc995b6c8892ec8802af438cfcc627b",
              "state": "processed"
            }
          ]
        },
        {
          "propertyId": 108473275,
          "type": "flat",
          "address": {
            "streetName": "de Alcántara",
            "streetNumber": "4",
            "visibility": "street",
            "postalCode": "28006",
            "town": "Madrid",
            "country": "Spain",
            "floor": "4",
            "latitude": 40.4262142,
            "longitude": -3.6738341
          },
          "reference": "ec-5031V",
          "contactId": 88485756,
          "operation": {
            "type": "sale",
            "price": 2550000
          },
          "descriptions": [
            {
              "language": "es",
              "text": "Vivienda totalmente reformada y amueblada de aproximadamente 269m², distribuidos en 4 habitaciones, 3 baños y 1 aseo, ubicada en la cuarta planta, en el barrio de Goya, distrito Salamanca.\n\n• 4 Habitaciones\n• 3 Baños\n• 1 Aseo\n• Exterior\n• Orientación Oeste\n• 4ª Planta\n• Ascensor\n• Terraza\n• Trastero\n• Conserje\n• Lavandería."
            }
          ],
          "additionalLink": "https://www.erikacasals.com/ad/108473275",
          "scope": "microsite",
          "state": "active",
          "features": {
            "areaConstructed": 269,
            "balcony": false,
            "bathroomNumber": 4,
            "conditionedAir": true,
            "conservation": "good",
            "energyCertificateRating": "D",
            "energyCertificateEmissionsRating": "D",
            "garden": false,
            "handicappedAdaptedAccess": false,
            "handicappedAdaptedUse": false,
            "orientationNorth": false,
            "orientationSouth": false,
            "orientationWest": true,
            "orientationEast": false,
            "parkingAvailable": false,
            "pool": false,
            "rooms": 4,
            "storage": true,
            "terrace": true,
            "wardrobes": true,
            "heatingType": "individual_gas",
            "currentOccupation": "free",
            "studio": false,
            "penthouse": false,
            "liftAvailable": true,
            "windowsLocation": "external",
            "duplex": false
          },
          "images": [
            {
              "imageId": 1345972350,
              "order": 1,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ec/97/b8/1345972350.jpg",
              "originalMD5CheckSum": "7d47ecb03f6c00b8560d3e067b0fdde2",
              "state": "processed"
            },
            {
              "imageId": 1345972348,
              "order": 2,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/20/a8/14/1345972348.jpg",
              "originalMD5CheckSum": "7c2e5f4b6e5d12df1ff717ad9f030f1f",
              "state": "processed"
            },
            {
              "imageId": 1345972359,
              "order": 3,
              "label": "living",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ff/18/ed/1345972359.jpg",
              "originalMD5CheckSum": "fbaf07da3e592ddaad0c6356bdc6d091",
              "state": "processed"
            },
            {
              "imageId": 1345972302,
              "order": 4,
              "label": "kitchen",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/1d/40/cf/1345972302.jpg",
              "originalMD5CheckSum": "306232a99a21f16de076d3743f80d472",
              "state": "processed"
            },
            {
              "imageId": 1345972360,
              "order": 5,
              "label": "unknown",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/ba/3c/e9/1345972360.jpg",
              "originalMD5CheckSum": "892e43886b0d5a06169cb9bdf11199ba",
              "state": "processed"
            },
            {
              "imageId": 1345972303,
              "order": 6,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/04/8e/dd/1345972303.jpg",
              "originalMD5CheckSum": "cb80d086b4df8bd24d03c582d369c9a7",
              "state": "processed"
            },
            {
              "imageId": 1345972368,
              "order": 7,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/51/ea/0e/1345972368.jpg",
              "originalMD5CheckSum": "fb11854ec9dc31e8b3ba7b362d04c183",
              "state": "processed"
            },
            {
              "imageId": 1345972369,
              "order": 8,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/7c/39/b9/1345972369.jpg",
              "originalMD5CheckSum": "fa14e0712c8f064278e745f8ec02aa5b",
              "state": "processed"
            },
            {
              "imageId": 1345972351,
              "order": 9,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/0a/54/71/1345972351.jpg",
              "originalMD5CheckSum": "fd881fdc6315801a6d77dd1a65cea564",
              "state": "processed"
            },
            {
              "imageId": 1345972352,
              "order": 10,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/e1/53/bf/1345972352.jpg",
              "originalMD5CheckSum": "bf38cb3756f994025b21d5fd2ea31526",
              "state": "processed"
            },
            {
              "imageId": 1345972370,
              "order": 11,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/4f/1a/8f/1345972370.jpg",
              "originalMD5CheckSum": "0d2869d05027a819caa703862b67e6b0",
              "state": "processed"
            },
            {
              "imageId": 1345972378,
              "order": 12,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/b6/41/c0/1345972378.jpg",
              "originalMD5CheckSum": "c53fa0733e2142492aa5d1348f02486f",
              "state": "processed"
            },
            {
              "imageId": 1345972353,
              "order": 13,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/77/c8/97/1345972353.jpg",
              "originalMD5CheckSum": "79170e234eb4d94ab644304c2b4f9456",
              "state": "processed"
            },
            {
              "imageId": 1345972371,
              "order": 14,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/fa/82/18/1345972371.jpg",
              "originalMD5CheckSum": "fb06945c00af5f69eb00247fb589c455",
              "state": "processed"
            },
            {
              "imageId": 1345972354,
              "order": 15,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/10/8e/65/1345972354.jpg",
              "originalMD5CheckSum": "f32ff57b2602dfba0a0436dffdac0a81",
              "state": "processed"
            },
            {
              "imageId": 1345972379,
              "order": 16,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/7f/fd/bc/1345972379.jpg",
              "originalMD5CheckSum": "ab7dff798982af33c027295d554c3f12",
              "state": "processed"
            },
            {
              "imageId": 1345972386,
              "order": 17,
              "label": "unknown",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/8c/12/28/1345972386.jpg",
              "originalMD5CheckSum": "152a31d11359ace7d038cf1e3f77de3d",
              "state": "processed"
            },
            {
              "imageId": 1345972380,
              "order": 18,
              "label": "bedroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/f4/8a/1e/1345972380.jpg",
              "originalMD5CheckSum": "528c9429ee27a50cc4328849106fcad6",
              "state": "processed"
            },
            {
              "imageId": 1345972381,
              "order": 19,
              "label": "bathroom",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/e8/d7/47/1345972381.jpg",
              "originalMD5CheckSum": "c8523e7bbd0ffa385754da67229ca9d3",
              "state": "processed"
            },
            {
              "imageId": 1345972552,
              "order": 20,
              "label": "plan",
              "url": "https://img3.idealista.com/blur/1500_80_mq/0/id.pro.es.image.master/05/01/e0/1345972552.jpg",
              "originalMD5CheckSum": "d261bdcbdf9972bdb478c8ce36f1075f",
              "state": "processed"
            }
          ]
        },
        {
          "propertyId": "U8n9eV04zpguZSihurAs8",
          "title": "Datos de prueba 3",
          "reference": "ex-rAs8",
          "descriptions": [
            "Villas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de Pulpí"
          ],
          "currency": "EUR",
          "address": {
            "streetName": "C. Viena, 1, 04640 Pulpí, Almería, España"
          },
          "features": {
            "areaConstructed": 130,
            "energyCertificateRating": 0,
            "rooms": 2,
            "bathroomNumber": 2
          },
          "images": [
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
              "title": "image-3",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 81047
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
              "title": "image-2",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 69348
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
              "title": "image-1",
              "description": "",
              "width": 1046,
              "height": 600,
              "size": 895498
            }
          ],
          "propertyType": "Apartamento",
          "propertyZone": "Inversion",
          "operation": {
            "type": "Alquiler",
            "price": 1500000,
            "features": [
              "Piscina"
            ]
          },
          "state": "Activo",
          "isActive": true,
          "createdAt": "2025-08-21T22:12:02.996Z",
          "updatedAt": "2025-08-21T22:12:02.996Z"
        },
        {
          "propertyId": "4dNoPOnKvQW2DMqNnZl2Oc",
          "title": "Datos de prueba 2",
          "reference": "ex-l2Oc",
          "descriptions": [
            "Villas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de Pulpí"
          ],
          "currency": "EUR",
          "address": {
            "streetName": "C. Costa del sol, 1, 04640 Pulpí, Almería, España"
          },
          "features": {
            "areaConstructed": 200,
            "energyCertificateRating": 0,
            "rooms": 2,
            "bathroomNumber": 1
          },
          "images": [
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
              "title": "image-3",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 81047
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
              "title": "image-2",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 69348
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
              "title": "image-1",
              "description": "",
              "width": 1046,
              "height": 600,
              "size": 895498
            }
          ],
          "propertyType": "Casa",
          "propertyZone": "Costa del Sol",
          "operation": {
            "type": "Alquiler",
            "price": 1000034,
            "features": [
              "Piscina",
              "Aire Acondicionado"
            ]
          },
          "state": "Activo",
          "isActive": true,
          "createdAt": "2025-08-21T22:03:17.633Z",
          "updatedAt": "2025-08-21T22:03:17.633Z"
        },
        {
          "propertyId": "1i93ErSxyxQxH0rVHJ4Tll",
          "title": "Dato de prueba",
          "reference": "ex-4Tll",
          "descriptions": [
            "Villas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de Pulpí"
          ],
          "currency": "EUR",
          "address": {
            "streetName": "C. Viena, 1, 04640 Pulpí, Almería, España"
          },
          "features": {
            "areaConstructed": 150,
            "energyCertificateRating": 0,
            "rooms": 2,
            "bathroomNumber": 3
          },
          "images": [
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
              "title": "image-1",
              "description": "",
              "width": 1046,
              "height": 600,
              "size": 895498
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
              "title": "image-2",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 69348
            },
            {
              "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
              "title": "image-3",
              "description": "",
              "width": 950,
              "height": 534,
              "size": 81047
            }
          ],
          "propertyType": "Piso",
          "propertyZone": "Costa Blanca",
          "operation": {
            "type": "Venta",
            "price": 1000000,
            "features": [
              "Piscina",
              "Aire Acondicionado",
              "Interior",
              "Libre"
            ]
          },
          "state": "Activo",
          "isActive": true,
          "createdAt": "2025-08-21T21:57:28.704Z",
          "updatedAt": "2025-08-21T21:57:28.704Z"
        }
      ];
    } catch (error) {
      console.error('Error fetching hardcoded properties:', error);
      throw error;
    }
  },

  getPropertiesByContenfulHardcoded() {
    return [
      {
        "propertyId": "U8n9eV04zpguZSihurAs8",
        "title": "Datos de prueba 3",
        "reference": "ex-rAs8",
        "descriptions": [
          "Villas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de PulpíVillas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de Pulpí"
        ],
        "currency": "EUR",
        "address": {
          "streetName": "C. Viena, 1, 04640 Pulpí, Almería, España"
        },
        "features": {
          "areaConstructed": 130,
          "energyCertificateRating": 0,
          "rooms": 2,
          "bathroomNumber": 2
        },
        "images": [
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
            "title": "image-3",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 81047
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
            "title": "image-2",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 69348
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
            "title": "image-1",
            "description": "",
            "width": 1046,
            "height": 600,
            "size": 895498
          }
        ],
        "propertyType": "Apartamento",
        "propertyZone": "Costa Blanca",
        "newProperty": "Inversion",
        "operation": {
          "type": "Alquiler",
          "price": 1500000,
          "features": [
            "Piscina"
          ]
        },
        "state": "Activo",
        "isActive": true,
        "createdAt": "2025-08-21T22:12:02.996Z",
        "updatedAt": "2025-08-21T22:12:02.996Z"
      },
      {
        "propertyId": "4dNoPOnKvQW2DMqNnZl2Oc",
        "title": "Datos de prueba 2",
        "reference": "ex-l2Oc",
        "descriptions": [
          "Proyecto exclusivo en preconstrucción con las mejores calidades y ubicación privilegiada en Costa del Sol"
        ],
        "currency": "EUR",
        "address": {
          "streetName": "C. Costa del sol, 1, 04640 Pulpí, Almería, España"
        },
        "features": {
          "areaConstructed": 200,
          "energyCertificateRating": 0,
          "rooms": 2,
          "bathroomNumber": 1
        },
        "images": [
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
            "title": "image-3",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 81047
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
            "title": "image-2",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 69348
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
            "title": "image-1",
            "description": "",
            "width": 1046,
            "height": 600,
            "size": 895498
          }
        ],
        "propertyType": "Casa",
        "propertyZone": "Costa del Sol",
        "newProperty": "Preconstrucción",
        "operation": {
          "type": "Alquiler",
          "price": 1000034,
          "features": [
            "Piscina",
            "Aire Acondicionado"
          ]
        },
        "state": "Activo",
        "isActive": true,
        "createdAt": "2025-08-21T22:03:17.633Z",
        "updatedAt": "2025-08-21T22:03:17.633Z"
      },
      {
        "propertyId": "1i93ErSxyxQxH0rVHJ4Tll",
        "title": "Dato de prueba",
        "reference": "ex-4Tll",
        "descriptions": [
          "Villas pareadas a tan solo 400 metros de las playas La Entrevista y Los Nardos – Mar de Pulpí"
        ],
        "currency": "EUR",
        "address": {
          "streetName": "C. Viena, 1, 04640 Pulpí, Almería, España"
        },
        "features": {
          "areaConstructed": 150,
          "energyCertificateRating": 0,
          "rooms": 2,
          "bathroomNumber": 3
        },
        "images": [
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/Gsp0iGbXtsmjn6hnkHb3t/08e34980db078e06c680ca85243a52f0/sales.png",
            "title": "image-1",
            "description": "",
            "width": 1046,
            "height": 600,
            "size": 895498
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/2Dv6qkXj0D1BnspYesHiwa/ca6adc82ceb7cb8fc9ac8d92b93d042f/tula-3.jpg",
            "title": "image-2",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 69348
          },
          {
            "url": "https://images.ctfassets.net/idspblp1qwgn/4oWhAH5JfO0wPXSTO4d6lE/5598a0a712fa916226c3a969d582bf26/tula-13.jpg",
            "title": "image-3",
            "description": "",
            "width": 950,
            "height": 534,
            "size": 81047
          }
        ],
        "propertyType": "Piso",
        "propertyZone": "Costa Blanca",
        "operation": {
          "type": "Venta",
          "price": 1000000,
          "features": [
            "Piscina",
            "Aire Acondicionado",
            "Interior",
            "Libre"
          ]
        },
        "state": "Activo",
        "isActive": true,
        "createdAt": "2025-08-21T21:57:28.704Z",
        "updatedAt": "2025-08-21T21:57:28.704Z"
      }
    ]
  },

  /**
   * Obtener una propiedad específica por ID
   * @param {string|number} id - ID de la propiedad
   * @returns {Promise<Object>} Datos de la propiedad
   */
  async getPropertyById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/idealista/properties/${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  /**
   * Buscar propiedades por ubicación específica
   * @param {string} location - Nombre de la ubicación
   * @param {Object} additionalParams - Parámetros adicionales
   * @returns {Promise<Object>} Respuesta de la API
   */
  async searchByLocation(location, additionalParams = {}) {
    return this.getProperties({
      location,
      ...additionalParams
    });
  },

  /**
   * Obtener propiedades de Madrid desde Idealista
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise<Object>} Respuesta de la API con propiedades de Idealista
   */
  async getPropertiesByMadrid(params = {}) {
    try {

      // Construir parámetros de consulta para Idealista
      const queryParams = new URLSearchParams();

      // Agregar parámetros opcionales
      if (params.page) queryParams.append('page', params.page);
      if (params.size) queryParams.append('size', params.size);
      if (params.state) queryParams.append('state', params.state);

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/idealista/properties${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Asegurar que devolvemos el formato esperado
      if (data && data.success) {
        return data;
      } else {
        return {
          success: true,
          data: {
            properties: data.properties || data || []
          }
        };
      }
    } catch (error) {
      console.error('Error fetching properties from Madrid (Idealista):', error);
      throw error;
    }
  },

  /**
   * Obtener propiedades por zona desde Contentful
   * @param {string} zone - Zona específica (ej: 'costa-del-sol', 'costa-blanca', 'barcelona')
   * @returns {Promise<Object>} Respuesta de la API con propiedades de Contentful
   */
  async getPropertiesByZone(zone) {
    try {
      const response = await fetch(`${API_BASE_URL}/contentful/properties/zone/${encodeURIComponent(zone)}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PropertyService: Received data:', data);
      
      // Asegurar que devolvemos el formato esperado
      if (data && data.success) {
        return data;
      } else {
        return {
          success: true,
          data: {
            properties: data.properties || data || []
          }
        };
      }

    } catch (error) {
      console.error('Error fetching properties by zone:', error);
      throw error;
    }
  },

  /**
   * Obtener propiedades por newProperty (Inversión/Preconstrucción)
   * @param {string} newProperty - Tipo de nueva propiedad ('inversion' o 'preconstruccion')
   * @returns {Promise<Object>} Respuesta de la API con propiedades filtradas
   */
  async getPropertiesByNewProperty(newProperty) {
    try {
      console.log('PropertyService: Fetching properties for newProperty:', newProperty);

      const url = `${API_BASE_URL}/contentful/properties/newproperty/${encodeURIComponent(newProperty)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PropertyService: Received data for newProperty:', data);
      return data;

    } catch (error) {
      console.error('Error fetching properties by newProperty:', error);
      throw error;
    }
  },

  /**
   * Obtener propiedades por newProperty y location combinados
   * @param {string} newProperty - Tipo de nueva propiedad ('inversion' o 'preconstruccion')
   * @param {string} location - Localidad específica (ej: 'costa-del-sol', 'costa-blanca')
   * @returns {Promise<Object>} Respuesta de la API con propiedades filtradas
   */
  async getPropertiesByNewPropertyAndLocation(newProperty, location) {
    try {
      console.log('PropertyService: Fetching properties for newProperty:', newProperty, 'and location:', location);

      const url = `${API_BASE_URL}/contentful/properties/newproperty/${encodeURIComponent(newProperty)}/location/${encodeURIComponent(location)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PropertyService: Received data for newProperty and location:', data);
      return data;

    } catch (error) {
      console.error('Error fetching properties by newProperty and location:', error);
      throw error;
    }
  },

  /**
   * Transformar datos de la API de Idealista al formato esperado por el frontend
   * @param {Object} apiProperty - Propiedad desde la API
   * @returns {Object} Propiedad transformada
   */
  transformProperty(apiProperty) {

    return {
      id: apiProperty.propertyId || apiProperty.id,
      propertyId: apiProperty.propertyId || apiProperty.propertyCode || apiProperty.id,
      title: apiProperty.title || `${apiProperty.propertyType} en ${apiProperty.location?.city || 'Madrid'}`,
      price: apiProperty.price || 0,
      currency: apiProperty.currency || 'EUR',
      address: {
        ...apiProperty.location?.address || apiProperty?.address || 'Dirección no disponible',
        town: apiProperty.location?.city || apiProperty?.propertyZone || 'Madrid',
      },
      rooms: apiProperty.rooms || 0,
      bathrooms: apiProperty.bathrooms || 0,
      size: apiProperty.size || 0,
      descriptions: apiProperty.descriptions || 'Descripción no disponible',
      thumbnail: apiProperty.images?.[0]?.url || '/images/default-property.jpg',
      images: apiProperty.images || [],
      features: apiProperty.features || [],
      propertyCode: apiProperty.propertyCode || 'N/A',
      propertyType: apiProperty.propertyType || 'homes',
      operation: apiProperty.operation || 'sale',
      energyRating: apiProperty.energyRating || 'N/A',
      publishedDate: apiProperty.publishedDate || new Date().toISOString().split('T')[0],
      contact: apiProperty.contact || { phone: null, email: null },
      coordinates: apiProperty.location?.coordinates || { latitude: 40.4168, longitude: -3.7038 }
    };
  }
};

export default propertyService;